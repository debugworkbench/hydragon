// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfigManager } from './debug-config-manager';
import { IDebugConfig } from 'debug-engine';
import { CompositeDisposable } from 'event-kit';
import { PagePresenter } from './page-presenter';
import {
  DialogModel, PageModel, NewDebugConfigDialogModel, GdbMiDebugConfigPageModel
} from './models/ui';

export class DebugConfigPresenter {
  private getExistingDebugConfig: (configName: string) => IDebugConfig;
  private setActiveDialog: (dialog: DialogModel) => void;
  private openPage: (pageId: string, createPage: () => PageModel) => void;

  constructor(params: DebugConfigPresenter.IConstructorParams) {
    Object.assign(this, params)
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
          this.setActiveDialog(null);
          resolve(dialog.debugConfig);
        } catch (error) {
          reject(error);
        }
      });
      this.setActiveDialog(dialog);
      dialog.open();
    });
  }

  private getDebugConfig(configName?: string): Promise<IDebugConfig> {
    return Promise.resolve()
    .then(() => {
      return configName ? this.getExistingDebugConfig(configName) : this.createDebugConfig();
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
        this.openPage(
          `debug-config:${debugConfig.name}`,
          () => {
            const page = new GdbMiDebugConfigPageModel({ id: `debug-config:${debugConfig.name}` });
            page.title = `Debug Config ${debugConfig.name}`;
            return page;
          }
        );
      }
    });
  }
}

namespace DebugConfigPresenter {
  export interface IConstructorParams {
    getExistingDebugConfig: (configName: string) => IDebugConfig;
    setActiveDialog: (dialog: DialogModel) => void;
    openPage: (pageId: string, createPage: () => PageModel) => void;
  }
}