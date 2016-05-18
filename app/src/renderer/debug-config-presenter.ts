// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfigManager } from './debug-config-manager';
import { IDebugConfig } from 'debug-engine';
import { PagePresenter } from './page-presenter';
import {
  WorkspaceModel, NewDebugConfigDialogModel, GdbMiDebugConfigPageModel
} from './models/ui';
import { PathPickerProxy } from './platform/path-picker-proxy';

export class DebugConfigPresenter {
  private debugConfigManager: DebugConfigManager;
  private workspace: WorkspaceModel;
  private pagePresenter: PagePresenter;
  private pathPicker: PathPickerProxy;

  constructor(params: DebugConfigPresenter.IConstructorParams) {
    Object.assign(this, params);
  }

  /**
   * Display a dialog that lets the user create a new debug configuration.
   *
   * @return A promise that will either be resolved with a new debug configuration,
   *         or with null if the user cancelled the operation.
   */
  private createDebugConfig(): Promise<IDebugConfig> {
    return new Promise((resolve, reject) => {
      let dialog = new NewDebugConfigDialogModel();
      let sub = dialog.onDidClose(() => {
        try {
          sub.unsubscribe();
          this.workspace.modalDialog = null;
          resolve(dialog.debugConfig);
        } catch (error) {
          reject(error);
        }
      });
      this.workspace.modalDialog = dialog;
      dialog.open();
    });
  }

  private getDebugConfig(configName?: string): Promise<IDebugConfig> {
    return Promise.resolve()
    .then(() => {
      return configName ? this.debugConfigManager.get(configName) : this.createDebugConfig();
    });
  }

  /**
   * Open a page that lets the user edit a debug configuration.
   *
   * @param configName Name of the debug configuration to edit, if this argument is omitted
   *                   the user will be prompted to create a new configuration that will
   *                   then be displayed for editing.
   */
  openDebugConfig(configName?: string): Promise<void> {
    return this.getDebugConfig(configName)
    .then(debugConfig => {
      if (debugConfig) {
        this.pagePresenter.openPage(
          `debug-config:${debugConfig.name}`,
          () => {
            const page = new GdbMiDebugConfigPageModel({
              id: `debug-config:${debugConfig.name}`,
              debugConfig,
              debugConfigManager: this.debugConfigManager,
              pathPicker: this.pathPicker
            });
            return page;
          }
        );
      }
    });
  }
}

namespace DebugConfigPresenter {
  export interface IConstructorParams {
    debugConfigManager: DebugConfigManager;
    workspace: WorkspaceModel;
    pagePresenter: PagePresenter;
    pathPicker: PathPickerProxy;
  }
}
