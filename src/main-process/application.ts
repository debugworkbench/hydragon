// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import ApplicationWindow from './application-window';

export interface IApplicationArgs {
  rootPath: string;
}

export default class Application {
  private _window: ApplicationWindow;

  run(args: IApplicationArgs): void {
    this._window = new ApplicationWindow();
    this._window.open({
      rootPath: args.rootPath
    });
  }
}
