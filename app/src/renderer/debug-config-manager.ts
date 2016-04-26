// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { IDebugConfig } from 'debug-engine';
import * as engineProvider from 'debug-engine';
import * as fs from 'fs';
import { Disposable, Emitter } from 'event-kit';

const DID_ADD_CONFIG_EVENT = 'add';
const DID_REMOVE_CONFIG_EVENT = 'remove';
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

/**
 * Saves and loads debug configs from a file.
 */
export class DebugConfigFileLoader implements IDebugConfigLoader {
  constructor(private configPath: string) {
  }

  canRead(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.access(this.configPath, fs.F_OK, (err) => {
        resolve(err ? false : true);
      });
    });
  }

  read(): Promise<Array<IDebugConfig>> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(this.configPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
    .then((data) => {
      return JSON.parse(data);
    });
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
 *
 * Debug configs are saved to a single file stored at the path passed to the constructor.
 * To modify a config, clone an existing one, modify the clone, then save the clone (this will
 * replace the existing config).
 */
export class DebugConfigManager {
  /** Original unmodified configs, should always be kept in sync with what's actually on disk. */
  private debugConfigs: IDebugConfig[];
  /** Copies of original configs, these contain changes that may be saved to disk or discared. */
  private pendingChanges: Map</*copy:*/IDebugConfig, /*original:*/IDebugConfig>;
  private emitter: Emitter;

  constructor(private loader: IDebugConfigLoader) {
    this.debugConfigs = [];
    this.pendingChanges = new Map<IDebugConfig, IDebugConfig>();
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
   * The returned config should be considered read-only, to modify a config call [[modify]].
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
   * The returned configs should be considered read-only, to modify a config call [[modify]].
   */
  getAll(): IDebugConfig[] {
    return this.debugConfigs;
  }

  /**
   * Make a copy of a config for modification.
   *
   * Once the returned config has been modified the changes can be saved to disk
   * by calling [[save]], or discarded by calling [[discardChanges]].
   * @return A copy of the given config.
   */
  modify(debugConfig: IDebugConfig): IDebugConfig {
    if (this.debugConfigs.indexOf(debugConfig) !== -1) {
      // prevent concurrent modification of the same config
      this.pendingChanges.forEach((originalConfig) => {
        if (debugConfig === originalConfig) {
          throw new Error(`Debug config "${originalConfig.name}" is already being modified.`);
        }
      });

      const copy = engineProvider.getEngine(debugConfig.engine).cloneConfig(debugConfig);
      this.pendingChanges.set(copy, debugConfig);
      return copy;
    } else {
      // this is a new config so there's no need to clone it
      return debugConfig;
    }
  }

  /**
   * Discard any modifications made to a config.
   *
   * @param debugConfig An unsaved config returned by [[modify]].
   */
  discardChanges(debugConfig: IDebugConfig): void {
    this.pendingChanges.delete(debugConfig);
  }

  /**
   * Save a new or modified config.
   *
   * @param debugConfig A newly created config or one returned by [[modify]].
   * @return A promise that will be resolved once the change has been written to disk.
   */
  save(debugConfig: IDebugConfig): Promise<void> {
    let originalConfig: IDebugConfig;
    return Promise.resolve().then(() => {
      // keep the original this.debugConfigs untouched until the updated configs are successfully
      // written to disk
      const configs = this.debugConfigs.slice(); // make a shallow copy
      originalConfig = this.pendingChanges.get(debugConfig);
      if (originalConfig) {
        const idx = configs.indexOf(originalConfig);
        if (idx > -1) {
          configs[idx] = debugConfig;
        } else {
          throw new Error(`Original config "${originalConfig.name}" not found.`);
        }
      } else { // new config
        if (configs.indexOf(debugConfig) !== -1) {
          throw new Error(`Config "${debugConfig.name}" has already been saved.`);
        }
        configs.push(debugConfig);
      }
      return configs;
    })
    .then((configs) => {
      return this.loader.write(configs)
      .then(() => {
        this.debugConfigs = configs;
        this.discardChanges(debugConfig);
        if (originalConfig) {
          if (originalConfig.name !== debugConfig.name) {
            this.emitter.emit(DID_RENAME_CONFIG_EVENT, <IDebugConfigRenameInfo> {
              newName: debugConfig.name, oldName: originalConfig.name
            });
          }
        } else {
          this.emitter.emit(DID_ADD_CONFIG_EVENT, debugConfig);
        }
      });
    });
  }

  /**
   * Permanently remove a config from memory and disk.
   *
   * @return A promise that will be resolved once the change has been written to disk.
   */
  remove(debugConfig: IDebugConfig): Promise<void> {
    return Promise.resolve().then(() => {
      let originalConfig = this.pendingChanges.get(debugConfig);
      if (!originalConfig) {
        originalConfig = debugConfig;
      }

      const configs = this.debugConfigs.slice(); // make a shallow copy
      const idx = configs.indexOf(originalConfig);
      if (idx > -1) {
        configs.splice(idx, 1); // remove the config
      }

      return this.loader.write(configs)
      .then(() => {
        this.discardChanges(debugConfig);
        this.debugConfigs = configs;
        this.emitter.emit(DID_REMOVE_CONFIG_EVENT, debugConfig);
      });
    });
  }

  /**
   * Load all configs from disk.
   *
   * @return A promise that will be resolved once all configs have been loaded.
   */
  load(): Promise<void> {
    return Promise.resolve().then(() => {
      this.debugConfigs = [];
      // FIXME: throw an error if there are pending changes?
      this.pendingChanges.clear();
    })
    .then(() => this.loader.canRead())
    .then((canRead) => {
      if (canRead) {
        return this.loader.read()
        .then((debugConfigs) => {
          this.debugConfigs = debugConfigs;
        });
      }
    });
  }
}
