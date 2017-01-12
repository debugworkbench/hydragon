// Copyright (c) 2015-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as url from 'url';
import { app, ipcMain } from 'electron';
import { Observable, Observer } from '@reactivex/rxjs';
import { ApplicationWindow } from './application-window';
import { AppProtocolHandler } from './protocol-handlers';
import UriPathResolver from '../common/uri-path-resolver';
import { DevTools } from './dev-tools';
import { PathPicker } from './platform/path-picker';
import { WindowMenuManager } from './platform/window-menu-manager';
import { ContextMenuManager } from './platform/context-menu-manager';
import { CommandTable } from '../common/command-table';
import * as cmds from '../common/command-ids';
import { Project } from './project';
import { OpenSourceDirCommand, OpenSourceFileCommand } from './commands';
import { MainIPCDispatcher } from './ipc-dispatcher';
import { WidgetPatch, IDisplayServer, IWindow, WidgetEvent } from '../display-server';
import { Application as ServerApp } from './server/application';

export interface IApplicationArgs {
  /** Path to the root directory of the application. */
  rootPath: string;
}

/**
 * An Electron app that hosts a display server.
 *
 * This app also hosts the back-end app that connects to the display server, the back-end app
 * currently runs in the main Electron process but it could be moved out to a separate process in
 * the future.
 */
export class Application {
  private _ipcDispatcher: MainIPCDispatcher;
  private _devTools: DevTools;
  private _window: ApplicationWindow;
  private _appProtocolHandler: AppProtocolHandler;
  private _pathPicker: PathPicker;
  private _windowMenuManager: WindowMenuManager;
  private _contextMenuManager: ContextMenuManager;
  private _commands: CommandTable;
  private _project: Project;
  private _serverApp: ServerApp;
  private _rootPath: string;

  run(args: IApplicationArgs): void {
    this._rootPath = args.rootPath;
    this._ipcDispatcher = new MainIPCDispatcher();
    this._devTools = new DevTools();
    const uriPathResolver = new UriPathResolver(args.rootPath);
    this._appProtocolHandler = new AppProtocolHandler(uriPathResolver);
    this._pathPicker = new PathPicker();
    this._project = new Project(this._ipcDispatcher);
    this._commands = new CommandTable();
    this.registerCommands();
    this._windowMenuManager = new WindowMenuManager(this._commands);
    this._contextMenuManager = new ContextMenuManager(this._commands);
    // start the back-end
    this._serverApp = new ServerApp();
    this._serverApp.run(
      app.getPath('userData'), new InProcessDisplayServer(this)
    );
  }

  createWindow(windowId: string, json: any) {
    this._window = new ApplicationWindow(windowId);
    const windowUrl = url.format({
      protocol: 'file',
      pathname: `${this._rootPath}/static/index.html`
    });
    this._window.open({
      windowUrl, config: {
        rootPath: this._rootPath,
        layout: json
      }
    });
  }

  updateWindow(windowId: string, patch: WidgetPatch) {
    this._window.applyPatch(patch);
  }

  registerCommands(): void {
    this._commands.add(cmds.OPEN_SRC_DIR, new OpenSourceDirCommand({
      pathPicker: this._pathPicker, project: this._project
    }));
    this._commands.add(cmds.OPEN_SRC_FILE, new OpenSourceFileCommand({
      project: this._project
    }));
    this._commands.add(cmds.QUIT_APP, { execute: () => app.quit() });
  }
}

/**
 * Simple display server that runs in the main process of the Electron app.
 */
class InProcessDisplayServer implements IDisplayServer {
  readonly eventStream: Observable<WidgetEvent>;

  constructor(private _app: Application) {
    this.eventStream = Observable.create((observer: Observer<WidgetEvent>) => {
      ipcMain.on('widget-event', (event: GitHubElectron.IMainIPCEvent, widgetEvent: WidgetEvent) =>
        observer.next(widgetEvent)
      );
    });
  }

  createWindow(win: IWindow): void {
    // create a new browser window and send the serialized window to the new process
    this._app.createWindow(win.id, win);
  }

  updateWindow(win: IWindow, patch: WidgetPatch): void {
    this._app.updateWindow(win.id, patch);
  }
}
