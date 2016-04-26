// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import DebugConfigManager from './debug-config-manager';
import { IDebugConfig } from 'debug-engine';
import ElementFactory from './elements/element-factory';
import { CompositeDisposable } from 'event-kit';
import { PagePresenter } from './page-presenter';
import { GdbMiDebugConfigPageModel } from './models/ui';

export default class DebugConfigPresenter {
  constructor(
    private debugConfigManager: DebugConfigManager,
    private elementFactory: ElementFactory,
    private pagePresenter: PagePresenter
  ) {}

  /**
   * Display a dialog that lets the user create a new debug configuration.
   *
   * @return A promise that will either be resolved with a new debug configuration,
   *         or with null if the user cancelled the operation.
   */
  private createDebugConfig(): Promise<IDebugConfig> {
    return new Promise((resolve, reject) => {
      let dialog = this.elementFactory.createNewDebugConfigDialog();
      document.body.appendChild(dialog);
      let subscriptions = new CompositeDisposable();
      subscriptions.add(dialog.onClosed((debugConfig: IDebugConfig) => {
        try {
          subscriptions.dispose();
          document.body.removeChild(dialog);
          dialog.destroy();
          subscriptions = null;
          dialog = null;
          resolve(debugConfig);
        } catch (error) {
          reject(error);
        }
      }));
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
   * Open a dialog that lets the user edit a debug configuration.
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
            const page = new GdbMiDebugConfigPageModel({ id: `debug-config:${debugConfig.name}` });
            page.title = `Debug Config ${debugConfig.name}`;
            return page;
          }
        );
      }
    });
  }
}
