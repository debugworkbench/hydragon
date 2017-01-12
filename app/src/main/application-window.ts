// Copyright (c) 2015-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import { BrowserWindow } from 'electron';
import { IAppWindowConfig } from '../common/app-window-config';
import * as AppWindowConfig from '../common/app-window-config';
import { WidgetPatch } from '../display-server';

export interface IApplicationWindowOpenParams {
  windowUrl: string;
  config: IAppWindowConfig;
}

export class ApplicationWindow {
  readonly id: string;

  private _browserWindow: GitHubElectron.BrowserWindow;

  constructor(id: string) {
    this.id = id;
  }

  open({ windowUrl, config }: IApplicationWindowOpenParams): void {
    const options: GitHubElectron.BrowserWindowOptions = {
      // the window will be shown later after everything is fully initialized
      show: false,
      title: 'Debug Workbench',
      webPreferences: {
        directWrite: true
      }
    };
    this._browserWindow = new BrowserWindow(options);
    this._bindEventHandlers();
    this._browserWindow.loadURL(windowUrl + '#' + AppWindowConfig.encodeToUriComponent(config));
  }

  private _bindEventHandlers(): void {
    this._browserWindow.on('closed', () => {
      this._browserWindow = null;
    });
  }

  applyPatch(patch: WidgetPatch): void {
    this._browserWindow.webContents.send('apply-widget-patch', patch);
  }
}
