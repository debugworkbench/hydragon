// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as electron from 'electron';
import MobxDevToolsComponent from 'mobx-react-devtools';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as ReactFreeStyle from 'react-free-style';
import * as DebugEngineProvider from 'debug-engine';
import { GdbMiDebugEngineProvider } from 'gdb-mi-debug-engine';
import * as mobx from 'mobx';
import ElementRegistry, { ElementManifestLoader } from './elements/element-registry';
import ElementFactory from './elements/element-factory';
import { importHref } from './utils';
import UriPathResolver from '../common/uri-path-resolver';
import { IAppWindowConfig } from '../common/app-window-config';
import { DebugConfigManager, DebugConfigFileLoader } from './debug-config-manager';
import { DebugConfigPresenter } from './debug-config-presenter';
import { RendererDevTools } from './dev-tools';
import { PagePresenter } from './page-presenter';
import {
  WorkspaceModel, CodeMirrorEditorPageModel, PageSetModel, PageTreeModel, GdbMiDebugConfigPageModel,
  DebugToolbarModel, NewDebugConfigDialogModel, DialogModel, DirectoryTreeModel
} from './components/models';
import { ElementFactory as ReactElementFactory } from './components/element-factory';
import {
  PageSetComponent, PageTreeComponent, CodeMirrorEditorPageComponent, GdbMiDebugConfigPageComponent,
  DebugToolbarComponent, NewDebugConfigDialogComponent, DirectoryTreeComponent, WorkspaceComponent
} from './components';
import { PathPickerProxy } from './platform/path-picker-proxy';
import { WindowMenu } from './platform/window-menu';
import * as cmds from '../common/command-ids';
import { RendererSourceDirRegistry } from './source-dir-registry';

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
  reactElementFactory: ReactElementFactory;
  rootPath: string;

  private windowMenu: WindowMenu;
  private devTools: RendererDevTools;
  private _sourceDirRegistry: RendererSourceDirRegistry;

  /** Create the renderer context for the current process. */
  static async create(config: IAppWindowConfig): Promise<RendererContext> {
    const newContext = new RendererContext(config);
    await newContext.initialize();
    return newContext;
  }

  constructor(config: IAppWindowConfig) {
    this.rootPath = config.rootPath;
    this.devTools = new RendererDevTools();
  }

  dispose(): void {
    if (this._sourceDirRegistry) {
      this._sourceDirRegistry.dispose();
    }
  }

  async initialize(): Promise<void> {
    const uriPathResolver = new UriPathResolver(this.rootPath);
    const elementManifestLoader = new ElementManifestLoader(uriPathResolver);
    this.elementRegistry = new ElementRegistry(uriPathResolver, elementManifestLoader);
    await this.elementRegistry.importManifestFromUri('app:///static/core-elements-manifest.json');
    this.elementFactory = new ElementFactory(this.elementRegistry);
    this.reactElementFactory = this._createReactElementFactory();
    this.windowMenu = this.createWindowMenu();
    this._sourceDirRegistry = new RendererSourceDirRegistry();

    const userDataDir = electron.remote.app.getPath('userData');
    const debugConfigsPath = path.join(userDataDir, 'HydragonDebugConfigs.json');
    const debugConfigLoader = new DebugConfigFileLoader(debugConfigsPath);
    const debugConfigManager = new DebugConfigManager(debugConfigLoader);
    DebugEngineProvider.register(new GdbMiDebugEngineProvider());
    await debugConfigManager.load();

    const workspaceModel = new WorkspaceModel();
    const pagePresenter = new PagePresenter(workspaceModel);
    const pathPicker = new PathPickerProxy();
    const debugConfigPresenter = new DebugConfigPresenter({
      debugConfigManager,
      pagePresenter,
      workspace: workspaceModel,
      pathPicker
    });

    const mainPageSet = new PageSetModel({ id: 'main-page-set', height: '100%' });
    const pageTree = new PageTreeModel({ id: 'page-tree', height: '100%' });
    const debugToolbar = new DebugToolbarModel({ id: 'debug-toolbar', debugConfigManager, debugConfigPresenter });
    const dirTree = new DirectoryTreeModel({ id: 'explorer', displayRoot: false, dirPaths: this._sourceDirRegistry.dirPaths });

    workspaceModel.createDefaultLayout({ mainPageSet, pageTree, debugToolbar, dirTree });

    const rootContainer = document.createElement('div');
    rootContainer.className = 'root-container';
    const styleRegistry = ReactFreeStyle.create();
    const overrideCursor = this.overrideCursor.bind(this);
    const resetCursor = this.resetCursor.bind(this);
    const rootComponent = styleRegistry.component(React.createClass({
      render: () => React.createElement(
        'div', null,
        React.createElement(WorkspaceComponent, {
          model: workspaceModel,
          elementFactory: this.reactElementFactory,
          overrideCursor, resetCursor
        }),
        React.createElement(styleRegistry.Element),
        React.createElement(MobxDevToolsComponent)
      )
    }));
    ReactDOM.render(React.createElement(rootComponent), rootContainer);
    document.body.appendChild(rootContainer);

    // TODO: these editor elements are only here for mockup purposes, they should be removed once
    // source files can be opened from the directory tree element
    pagePresenter.openPage('test-page', () => {
      const page = new CodeMirrorEditorPageModel({ id: 'SourceFile1' });
      page.title = 'Page 1';
      page.editorConfig = {
        value: 'int main(int argc, char** argv) { return 0; }',
        mode: 'text/x-c++src'
      };
      return page;
    });
    pagePresenter.openPage('test-page2', () => {
      const page = new CodeMirrorEditorPageModel({ id: 'SourceFile2' });
      page.title = 'Page 2';
      page.editorConfig = {
        value: 'int main(int argc, char** argv) { return 1; }',
        mode: 'text/x-c++src'
      };
      return page;
    });

    dirTree.addDirectory(__dirname);
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

  private _createReactElementFactory(): ReactElementFactory {
    const factory = new ReactElementFactory();

    factory.registerElementConstructor(PageSetModel, ({ model, key }) =>
      React.createElement(PageSetComponent, { model, key })
    );
    factory.registerElementConstructor(PageTreeModel, ({ model, key }) =>
      React.createElement(PageTreeComponent, { model, key })
    );
    factory.registerElementConstructor(CodeMirrorEditorPageModel, ({ model, key }) =>
      React.createElement(CodeMirrorEditorPageComponent, { model, key })
    );
    factory.registerElementConstructor(GdbMiDebugConfigPageModel, ({ model, key }) =>
      React.createElement(GdbMiDebugConfigPageComponent, { model, key })
    );
    factory.registerElementConstructor(DebugToolbarModel, ({ model, key }) =>
      React.createElement(DebugToolbarComponent, { model, key })
    );
    factory.registerElementConstructor(NewDebugConfigDialogModel, ({ model, key }) =>
      React.createElement(NewDebugConfigDialogComponent, { model, key })
    );
    factory.registerElementConstructor(DirectoryTreeModel, ({ model, key }) =>
      React.createElement(DirectoryTreeComponent, { model, key })
    );

    return factory;
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
