// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import ApplicationWindow from './application-window';
import { AppProtocolHandler } from './protocol-handlers';

export interface IApplicationArgs {
  rootPath: string;
}

export default class Application {
  private _window: ApplicationWindow;
  private _appProtocolHandler: AppProtocolHandler;

  run(args: IApplicationArgs): void {
    this._appProtocolHandler = new AppProtocolHandler(args.rootPath);
    this._window = new ApplicationWindow();
    this._window.open({
      rootPath: args.rootPath
    });
  }
}
