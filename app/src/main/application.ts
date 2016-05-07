// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as url from 'url';
import { ApplicationWindow } from './application-window';
import { AppProtocolHandler } from './protocol-handlers';
import UriPathResolver from '../common/uri-path-resolver';
import * as DevTools from './dev-tools';
import { PathPicker } from './platform/path-picker';

export interface IApplicationArgs {
  /** Path to the root directory of the application. */
  rootPath: string;
}

export class Application {
  private _window: ApplicationWindow;
  private _appProtocolHandler: AppProtocolHandler;
  private _pathPicker: PathPicker;

  run(args: IApplicationArgs): void {
    DevTools.register();
    const uriPathResolver = new UriPathResolver(args.rootPath);
    this._appProtocolHandler = new AppProtocolHandler(uriPathResolver);
    this._pathPicker = new PathPicker();
    this._window = new ApplicationWindow();
    const windowUrl = url.format({
      protocol: 'file',
      pathname: `${args.rootPath}/static/index.html`
    });
    this._window.open({
      windowUrl, config: { rootPath: args.rootPath }
    });
  }
}
