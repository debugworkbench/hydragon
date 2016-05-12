// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { IDebugConfig } from 'debug-engine';
import * as engineProvider from 'debug-engine';
import * as fs from 'fs';
import { Disposable, Emitter } from 'event-kit';
import * as ajv from 'ajv';

const DID_ADD_CONFIG_EVENT = 'add';
const DID_REMOVE_CONFIG_EVENT = 'remove';
// FIXME: This event is no longer emitted, figure out if it should be!
const DID_RENAME_CONFIG_EVENT = 'rename';

export interface IDebugConfigRenameInfo {
  newName: string;
  oldName: string;
}

/**
 * Saves and loads debug configs.
 */
export interface IDebugConfigLoader {
  canRead(): Promise<boolean>;
  read(): Promise<Array<IDebugConfig>>;
  write(configs: IDebugConfig[]): Promise<void>;
}

// JSON schema for debug configurations created for the gdb-mi debug engine
// FIXME: This doesn't belong here, should probably move it to the gdb-mi-debug-engine package
const gdbMiDebugConfigSchema = {
  '$schema': 'http://json-schema.org/draft-04/schema#',
  title: 'Debug Config',
  description: 'Debug configuration for the gdb-mi debug engine',
  type: 'object',
  properties: {
    debuggerType: {
      description: 'Debugger type',
      enum: [0, 1]
    },
    debuggerPath: {
      description: 'Local file path to the debugger executable',
      type: 'string'
    },
    executable: {
      description: 'Local file path to the target executable',
      type: 'string'
    },
    executableArgs: {
      description: 'Arguments to pass to the target executable',
      type: 'string'
    },
    targetIsRemote: {
      description: 'Indicates whether or not the target executable is actually on a remote machine',
      type: 'boolean'
    },
    host: {
      description: 'Host to connect to for remote debugging',
      type: 'string'
    },
    port: {
      description: 'Port to connect to for remote debugging',
      type: 'number'
    }
  }
};

/**
 * Saves and loads debug configs from a file.
 */
export class DebugConfigFileLoader implements IDebugConfigLoader {
  private jsonSchemaValidator: ajv.Ajv;
  private validateDebugConfig: ajv.ValidateFunction;

  constructor(private configPath: string) {
    const jsonSchemaValidatorOptions: ajv.Options = {
      // convert strings that represent numbers and booleans to the approriate JS primitive type
      coerceTypes: true
    };
    this.jsonSchemaValidator = ajv(jsonSchemaValidatorOptions);
    this.validateDebugConfig = this.jsonSchemaValidator.compile(gdbMiDebugConfigSchema);
  }

  canRead(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.access(this.configPath, fs.F_OK, (err) => {
        resolve(err ? false : true);
      });
    });
  }

  async read(): Promise<Array<IDebugConfig>> {
    const data = await new Promise<string>((resolve, reject) => {
      fs.readFile(this.configPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
    const configs: IDebugConfig[] = JSON.parse(data);
    const validConfigs: IDebugConfig[] = [];
    configs.forEach(config => {
      if (this.validateDebugConfig(config)) {
        validConfigs.push(config);
      }
      // TODO: report validation errors
    })
    return validConfigs;
  }

  write(configs: IDebugConfig[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(this.configPath, JSON.stringify(configs, null, 2), { encoding: 'utf8' }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * Manages access to debug configs.
 */
export class DebugConfigManager {
  /** Original unmodified configs, should always be kept in sync with what's actually on disk. */
  private debugConfigs: IDebugConfig[];
  private emitter: Emitter;

  constructor(private loader: IDebugConfigLoader) {
    this.debugConfigs = [];
    this.emitter = new Emitter();
  }

  /** Add a function that should be called after a new debug config is saved. */
  onDidAddConfig(callback: (addedConfig: IDebugConfig) => void): Disposable {
    return this.emitter.on(DID_ADD_CONFIG_EVENT, callback);
  }

  /** Add a function that should be called after a debug config is permanently removed. */
  onDidRemoveConfig(callback: (removedConfig: IDebugConfig) => void): Disposable {
    return this.emitter.on(DID_REMOVE_CONFIG_EVENT, callback);
  }

  /** Add a function that should be called after a name change is saved. */
  onDidRenameConfig(callback: {({ newName, oldName }: IDebugConfigRenameInfo): void}): Disposable {
    return this.emitter.on(DID_RENAME_CONFIG_EVENT, callback);
  }

  /**
   * Get a saved debug config with the given name.
   *
   * @return A matching IDebugConfig, or null.
   */
  get(configName: string): IDebugConfig {
    for (let i = 0; i < this.debugConfigs.length; ++i) {
      if (this.debugConfigs[i].name === configName) {
        return this.debugConfigs[i];
      }
    }
    return null;
  }

  /**
   * Get all saved debug configs.
   */
  getAll(): IDebugConfig[] {
    return this.debugConfigs;
  }

  /**
   * Save a new or modified config.
   *
   * @param debugConfig A config to save to disk.
   * @return A promise that will be resolved once the change has been written to disk.
   */
  async save(debugConfig: IDebugConfig): Promise<void> {
    // keep the original this.debugConfigs untouched until the updated configs are successfully
    // written to disk
    const configs = this.debugConfigs.slice(); // make a shallow copy
    const idx = this.debugConfigs.findIndex(config => config.name === debugConfig.name);
    const isNewConfig = idx === -1;
    if (isNewConfig) {
      configs.push(debugConfig);
    } else {
      configs[idx] = debugConfig;
    }
    await this.loader.write(configs);
    this.debugConfigs = configs;
    if (isNewConfig) {
      this.emitter.emit(DID_ADD_CONFIG_EVENT, debugConfig);
    }
  }

  /**
   * Permanently remove a config from memory and disk.
   *
   * @return A promise that will be resolved once the change has been written to disk.
   */
  async remove(debugConfig: IDebugConfig): Promise<void> {
    const configs = this.debugConfigs.slice(); // make a shallow copy
    const idx = this.debugConfigs.findIndex(config => config.name === debugConfig.name);
    if (idx !== -1) {
      configs.splice(idx, 1); // remove the config
    } else {
      throw new Error(`Can't remove debug config ${debugConfig.name} as it was never saved.`);
    }
    await this.loader.write(configs);
    this.debugConfigs = configs;
    this.emitter.emit(DID_REMOVE_CONFIG_EVENT, debugConfig);
  }

  /**
   * Load all configs from disk.
   *
   * @return A promise that will be resolved once all configs have been loaded.
   */
  async load(): Promise<void> {
    this.debugConfigs = [];
    if (this.loader.canRead()) {
      this.debugConfigs = await this.loader.read();
    }
  }
}
