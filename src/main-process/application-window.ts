// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as url from 'url';
import * as BrowserWindow from 'browser-window';

export interface IApplicationWindowOpenParams {
  /** Path to the root directory of the application. */
  rootPath: string;
}

export default class ApplicationWindow {
  private _browserWindow: GitHubElectron.BrowserWindow;

  open({ rootPath }: IApplicationWindowOpenParams): void {
    const options = <GitHubElectron.BrowserWindowOptions> {
      // the window will be shown later after everything is fully initialized
      show: false,
      title: 'Debug Workbench',
      'web-preferences': {
        'direct-write': true
      }
    };
    this._browserWindow = new BrowserWindow(options);
    this._browserWindow.loadUrl(url.format({
      protocol: 'file',
      pathname: `${rootPath}/static/index.html`
    }));

    this._bindEventHandlers();
  }

  private _bindEventHandlers(): void {
    this._browserWindow.on('closed', () => {
      this._browserWindow = null;
    });
  }
}
