// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as url from 'url';
import { app } from 'electron';
import { ApplicationWindow } from './application-window';
import { AppProtocolHandler } from './protocol-handlers';
import UriPathResolver from '../common/uri-path-resolver';
import { DevTools } from './dev-tools';
import { PathPicker } from './platform/path-picker';
import { WindowMenuManager } from './platform/window-menu-manager';
import { CommandTable } from '../common/command-table';
import * as cmds from '../common/command-ids';

export interface IApplicationArgs {
  /** Path to the root directory of the application. */
  rootPath: string;
}

export class Application {
  private _devTools: DevTools;
  private _window: ApplicationWindow;
  private _appProtocolHandler: AppProtocolHandler;
  private _pathPicker: PathPicker;
  private _windowMenuManager: WindowMenuManager;
  private _commands: CommandTable;

  run(args: IApplicationArgs): void {
    this._devTools = new DevTools();
    const uriPathResolver = new UriPathResolver(args.rootPath);
    this._appProtocolHandler = new AppProtocolHandler(uriPathResolver);
    this._pathPicker = new PathPicker();
    this._commands = new CommandTable();
    this.registerCommands();
    this._windowMenuManager = new WindowMenuManager(this._commands);
    this._window = new ApplicationWindow();
    const windowUrl = url.format({
      protocol: 'file',
      pathname: `${args.rootPath}/static/index.html`
    });
    this._window.open({
      windowUrl, config: { rootPath: args.rootPath }
    });
  }

  registerCommands(): void {
    this._commands.add(cmds.QUIT_APP, { execute: () => app.quit() });
  }
}
