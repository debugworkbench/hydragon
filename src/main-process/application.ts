// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as url from 'url';
import { ApplicationWindow } from './application-window';
import { AppProtocolHandler } from './protocol-handlers';

export interface IApplicationArgs {
  /** Path to the root directory of the application. */
  rootPath: string;
}

export class Application {
  private _window: ApplicationWindow;
  private _appProtocolHandler: AppProtocolHandler;

  run(args: IApplicationArgs): void {
    this._appProtocolHandler = new AppProtocolHandler(args.rootPath);
    this._window = new ApplicationWindow();
    const windowUrl = url.format({
      protocol: 'file',
      pathname: `${args.rootPath}/static/index.html`
    });
    this._window.open({
      windowUrl
    });
  }
}
