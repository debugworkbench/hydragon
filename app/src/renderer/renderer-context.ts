// Copyright (c) 2015-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as electron from 'electron';
import { ipcRenderer } from 'electron';
import MobxDevToolsComponent from 'mobx-react-devtools';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as ReactFreeStyle from 'react-free-style';
import { GdbMiDebugEngineProvider } from 'gdb-mi-debug-engine';
import * as mobx from 'mobx';
import ElementRegistry, { ElementManifestLoader } from './elements/element-registry';
import ElementFactory from './elements/element-factory';
import { importHref } from './utils';
import UriPathResolver from '../common/uri-path-resolver';
import { IAppWindowConfig } from '../common/app-window-config';
import { RendererDevTools } from './dev-tools';
import { WindowMenu } from './platform/window-menu';
import * as cmds from '../common/command-ids';
import { RendererIPCDispatcher } from './ipc-dispatcher';
import { Reactor } from './reactor';
import { WindowComponent } from './components/workspace/window';
import { WindowModel } from './components/workspace/window-model';
import { ComponentModelFactory } from './component-model-factory';
import { WidgetPatch, WidgetEvent } from '../display-server';

export const enum Cursor {
  HorizontalResize,
  VerticalResize
}

/**
 * Singleton that provides access to all core Debug Workbench functionality.
 */
export class RendererContext {
  private _cursorOverlay: HTMLElement;

  elementRegistry: ElementRegistry;
  elementFactory: ElementFactory;
  rootPath: string;

  private windowMenu: WindowMenu;
  private devTools: RendererDevTools;
  private _ipcDispatcher: RendererIPCDispatcher;
  private _windowId: string;

  /** Create the renderer context for the current process. */
  static async create(config: IAppWindowConfig): Promise<RendererContext> {
    const newContext = new RendererContext();
    await newContext.initialize(config);
    return newContext;
  }

  dispose(): void {
    // noop
  }

  async initialize(config: IAppWindowConfig): Promise<void> {
    this.rootPath = config.rootPath;
    this._ipcDispatcher = new RendererIPCDispatcher();
    this.devTools = new RendererDevTools();
    const uriPathResolver = new UriPathResolver(this.rootPath);
    const elementManifestLoader = new ElementManifestLoader(uriPathResolver);
    this.elementRegistry = new ElementRegistry(uriPathResolver, elementManifestLoader);
    await this.elementRegistry.importManifestFromUri('app:///static/core-elements-manifest.json');
    this.elementFactory = new ElementFactory(this.elementRegistry);
    this.windowMenu = this.createWindowMenu();
/*
    PREVIOUS ITERATION (for reference)

    const workspaceModel = new WorkspaceModel();
    const pagePresenter = new PagePresenter(workspaceModel);
    const pathPicker = new PathPickerProxy();
    const debugConfigPresenter = new DebugConfigPresenter({
      debugConfigManager,
      pagePresenter,
      workspace: workspaceModel,
      pathPicker
    });
    this._sourceFilePresenter = new SourceFilePresenter({
      pagePresenter, ipcDispatcher: this._ipcDispatcher
    });

    const mainPageSet = new PageSetModel({ id: 'main-page-set', height: '100%' });
    const pageTree = new PageTreeModel({ id: 'page-tree', height: '100%' });
    const debugToolbar = new DebugToolbarModel({ id: 'debug-toolbar', debugConfigManager, debugConfigPresenter });
    this._dirTree = new DirectoryTreeModel({
      id: 'explorer', displayRoot: false, srcDirRegistry: this._sourceDirRegistry,
      ipcDispatcher: this._ipcDispatcher
    });

    workspaceModel.createDefaultLayout({
      mainPageSet, pageTree, debugToolbar, dirTree: this._dirTree
    });
*/
    const modelFactory = new ComponentModelFactory(this._sendWidgetEventToMainProcess);
    const windowModel = <WindowModel>(modelFactory.createModel(config.layout));
    this._windowId = windowModel.id;

    ipcRenderer.on('apply-widget-patch', (event, patch: WidgetPatch) =>
      patch.forEach(change => windowModel.applyWidgetChange(change, modelFactory.createModel))
    );

    const reactor = new Reactor();

    const rootContainer = document.createElement('div');
    rootContainer.className = 'root-container';
    const styleRegistry = ReactFreeStyle.create();
    const overrideCursor = this.overrideCursor.bind(this);
    const resetCursor = this.resetCursor.bind(this);

    const rootComponent = styleRegistry.component(React.createClass({
      render: () => React.createElement(
        'div', null,
        React.createElement(WindowComponent, {
          model: windowModel,
          renderChild: reactor.createReactElement.bind(reactor),
          overrideCursor, resetCursor
        }),
        React.createElement(styleRegistry.Element),
        React.createElement(MobxDevToolsComponent)
      )
    }));
    ReactDOM.render(React.createElement(rootComponent), rootContainer);
    document.body.appendChild(rootContainer);
  }

  private _sendWidgetEventToMainProcess = (event: WidgetEvent): void => {
    ipcRenderer.send('widget-event', event);
  }

  showWindow(): void {
    electron.remote.getCurrentWindow().show();
  }

  /**
   * Override the browser cursor image.
   *
   * To stop overriding the browser cursor call [[resetCursor]].
   */
  overrideCursor(cursor: Cursor): void {
    // the cursor is overriden by creating an overlay that covers the entire document body
    // and setting the cursor for the overlay to the one requested
    if (!this._cursorOverlay) {
      this._cursorOverlay = document.createElement('div');
      const style = this._cursorOverlay.style;
      style.position = 'absolute';
      style.left = '0px';
      style.right = '0px';
      style.width = '100%';
      style.height = '100%';
      style.zIndex = '1000000';
    }

    let cursorName: string;

    switch (cursor) {
      case Cursor.HorizontalResize:
        cursorName = 'ew-resize';
        break;

      case Cursor.VerticalResize:
        cursorName = 'ns-resize';
        break;
    }

    if (cursorName) {
      this._cursorOverlay.style.cursor = cursorName;
      if (!this._cursorOverlay.parentNode) {
        document.body.appendChild(this._cursorOverlay);
      }
    }
  }

  /**
   * Stop overriding the browser cursor image.
   */
  resetCursor(): void {
    if (this._cursorOverlay) {
      if (this._cursorOverlay.parentNode) {
        document.body.removeChild(this._cursorOverlay);
      } else {
        throw new Error('The cursor overlay is not attached to the document!');
      }
    }
  }

  private createWindowMenu(): WindowMenu {
    const menu = new WindowMenu();

    if (process.platform === 'darwin') {
      const appName = 'Hydragon';
      const appMenu = menu.subMenu(appName);
      appMenu.item(`About ${appName}`, { role: 'about' });
      appMenu.separator();
      appMenu.item(`Hide ${appName}`, { accelerator: 'Command+H', role: 'hide' });
      appMenu.item('Hide Others', { accelerator: 'Command+Shift+H', role: 'hideothers' });
      appMenu.item('Show All', { role: 'unhide' });
      appMenu.separator();
      appMenu.item('Quit', { accelerator: 'Command+Q', action: cmds.QUIT_APP });
    }

    const fileMenu = menu.subMenu('&File');
    fileMenu.item('Open Source Directory...', { action: cmds.OPEN_SRC_DIR });
    if (process.platform !== 'darwin') {
      fileMenu.separator();
      fileMenu.item('E&xit', { action: cmds.QUIT_APP });
    }

    const editMenu = menu.subMenu('&Edit');
    editMenu.item('Undo', { accelerator: 'CmdOrCtrl+Z', role: 'undo' });
    editMenu.item('Redo', {
      accelerator: (process.platform === 'darwin') ? 'Shift+CmdOrCtrl+Z' : 'Ctrl+Y',
      role: 'redo'
    });
    editMenu.separator();
    editMenu.item('Cut', { accelerator: 'CmdOrCtrl+X', role: 'cut' });
    editMenu.item('Copy', { accelerator: 'CmdOrCtrl+C', role: 'copy' });
    editMenu.item('Paste', { accelerator: 'CmdOrCtrl+V', role: 'paste' });
    editMenu.item('Select All', { accelerator: 'CmdOrCtrl+A', role: 'selectall' });

    const devMenu = menu.subMenu('&Developer');
    devMenu.item('Reload', { accelerator: 'CmdOrCtrl+R', action: () => this.devTools.reloadPage() });
    const devToolsMenu = devMenu.subMenu('DevTools');
    devToolsMenu.checkedItem('Electron', {
      accelerator: (process.platform === 'darwin') ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      isChecked: mobx.computed(() => this.devTools.isWindowOpen),
      action: item => {
        if (item.isChecked !== this.devTools.isWindowOpen) {
          item.isChecked ? this.devTools.open() : this.devTools.close();
        }
      }
    });
    devToolsMenu.checkedItem('Mobx', { isChecked: true, isEnabled: false });

    const windowMenu = menu.subMenu('&Window', { role: 'window' });
    windowMenu.item('Minimize', { accelerator: 'CmdOrCtrl+M', role: 'minimize' });
    windowMenu.item('Close', { accelerator: 'CmdOrCtrl+W', role: 'close' });
    if (process.platform === 'darwin') {
      windowMenu.separator();
      windowMenu.item('Bring All to Front', { role: 'front' });
    }

    menu.resync();
    return menu;
  }
}
