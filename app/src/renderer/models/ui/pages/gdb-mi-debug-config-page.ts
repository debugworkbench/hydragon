// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable, transaction } from 'mobx';
import { IGdbMiDebugConfig, DebuggerType } from 'gdb-mi-debug-engine';
import { PageModel } from './page';
import { FileInputModel } from '../file-input';
import { PathPickerProxy } from '../../../platform/path-picker-proxy';
import { DebugConfigManager, IDebugConfig } from '../../../debug-config-manager';
import { omitOwnProps } from '../../../../common/utils';

export class GdbMiDebugConfigPageModel extends PageModel {
  @observable
  debuggerType: DebuggerType;
  @observable
  executable: FileInputModel; // FIXME: rename to targetExe
  @observable
  debuggerPath: FileInputModel; // FIXME: rename to debuggerExe
  @observable
  executableArgs: string; // FIXME: rename to targetExeArgs
  @observable
  targetIsRemote: boolean; // FIXME: rename to isTargetRemote
  @observable
  host: string; // FIXME: rename to debuggerHost
  @observable
  port: number; // FIXME: rename to debuggerPort

  @observable
  private savedState: IGdbMiDebugConfig;

  private debugConfigName: string;
  private debugConfigManager: DebugConfigManager;
  private isSaveInProgress = false;

  private get currentState(): IGdbMiDebugConfig {
    return {
      name: this.debugConfigName,
      engine: 'gdb-mi',
      debuggerType: this.debuggerType,
      debuggerPath: this.debuggerPath.path,
      executable: this.executable.path,
      executableArgs: this.executableArgs,
      targetIsRemote: this.targetIsRemote,
      host: this.host,
      port: this.port
    };
  }

  get isDirty(): boolean {
    return !compareDebugConfigs(this.savedState, this.currentState);
  }

  constructor({
    id, debugConfig, debugConfigManager, pathPicker
  }: GdbMiDebugConfigPageModel.IConstructorParams) {
    super({ id });
    this.debugConfigManager = debugConfigManager;
    transaction(() => {
      this.savedState = ((<IDebugConfig> debugConfig).timestamp !== undefined) ? debugConfig : null;
      if (debugConfig) {
        this.title = `Debug Config ${debugConfig.name}`;
        this.debugConfigName = debugConfig.name;
        this.debuggerType = debugConfig.debuggerType;
        this.executable = new FileInputModel({
          defaultPath: debugConfig.executable, pathKind: 'file', pathPicker
        });
        this.debuggerPath = new FileInputModel({
          defaultPath: debugConfig.debuggerPath, pathKind: 'file', pathPicker
        });
        this.executableArgs = debugConfig.executableArgs;
        this.targetIsRemote = debugConfig.targetIsRemote;
        this.host = debugConfig.host;
        this.port = debugConfig.port;
      } else {
        this.executable = new FileInputModel({ pathKind: 'file', pathPicker });
        this.debuggerPath = new FileInputModel({ pathKind: 'file', pathPicker });
      }
    });
  }

  /**
   * Save the current changes to disk.
   *
   * @return A promise that will be resolved after the changes have been persisted.
   */
  async save(): Promise<void> {
    if (!this.isSaveInProgress) {
      this.isSaveInProgress = true;
      // remove the timestamp since it shouldn't be written out
      const currentState = omitOwnProps(this.currentState, ['timestamp']);
      await this.debugConfigManager.save(currentState);
      this.savedState = currentState;
      this.isSaveInProgress = false;
    }
  }
}

export namespace GdbMiDebugConfigPageModel {
  export interface IConstructorParams extends PageModel.IConstructorParams {
    debugConfig?: IGdbMiDebugConfig;
    debugConfigManager: DebugConfigManager;
    pathPicker: PathPickerProxy;
  }
}

/**
 * Compare two debug configs by value.
 *
 * @return `true` if the two configs are equivalent, `false` otherwise.
 */
function compareDebugConfigs(a: IGdbMiDebugConfig, b: IGdbMiDebugConfig): boolean {
  if (a === b) {
    return true;
  }
  if ((a == null) && (b == null)) {
    return true;
  }
  if ((a == null) || (b == null)) {
    return false;
  }
  return (a.name === b.name)
  && (a.engine === b.engine)
  && (a.debuggerType === b.debuggerType)
  && (a.debuggerPath === b.debuggerPath)
  && (a.executable === b.executable)
  && (a.executableArgs === b.executableArgs)
  && (a.targetIsRemote === b.targetIsRemote)
  && (a.host === b.host)
  && (a.port === b.port);
}
