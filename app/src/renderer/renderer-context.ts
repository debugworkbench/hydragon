// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as electron from 'electron';
import MobxDevToolsComponent from 'mobx-react-devtools';
import ElementRegistry, { ElementManifestLoader } from './elements/element-registry';
import ElementFactory from './elements/element-factory';
import { WorkspaceComponent } from './components/workspace';
import { importHref } from './utils';
import UriPathResolver from '../common/uri-path-resolver';
import { IAppWindowConfig } from '../common/app-window-config';
import { DebugConfigManager, DebugConfigFileLoader } from './debug-config-manager';
import { DebugConfigPresenter } from './debug-config-presenter';
import * as DebugEngineProvider from 'debug-engine';
import { GdbMiDebugEngineProvider } from 'gdb-mi-debug-engine';
import { RendererDevTools } from './dev-tools';
import { PagePresenter } from './page-presenter';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as ReactFreeStyle from 'react-free-style';
import {
  WorkspaceModel, CodeMirrorEditorPageModel, PageSetModel, PageTreeModel, GdbMiDebugConfigPageModel,
  DebugToolbarModel, NewDebugConfigDialogModel, DialogModel
} from './models/ui';
import { ElementFactory as ReactElementFactory } from './components/element-factory';
import {
  PageSetComponent, PageTreeComponent, CodeMirrorEditorPageComponent, GdbMiDebugConfigPageComponent,
  DebugToolbarComponent, NewDebugConfigDialogComponent
} from './components';
import { PathPickerProxy } from './platform/path-picker-proxy';
import { WindowMenu } from './platform/window-menu';
import * as mobx from 'mobx';

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

  async initialize(): Promise<void> {
    await importHref('app:///bower_components/dependencies_bundle.html');
    const uriPathResolver = new UriPathResolver(this.rootPath);
    await importHref('app:///static/dark-paper-elements-theme.html');
    const elementManifestLoader = new ElementManifestLoader(uriPathResolver);
    this.elementRegistry = new ElementRegistry(uriPathResolver, elementManifestLoader);
    await this.elementRegistry.importManifestFromUri('app:///static/core-elements-manifest.json');
    this.elementFactory = new ElementFactory(this.elementRegistry);

    this.reactElementFactory = new ReactElementFactory();
    this.reactElementFactory.registerElementConstructor(PageSetModel, ({ model, key }) =>
      React.createElement(PageSetComponent, { model, key })
    );
    this.reactElementFactory.registerElementConstructor(PageTreeModel, ({ model, key }) =>
      React.createElement(PageTreeComponent, { model, key })
    );
    this.reactElementFactory.registerElementConstructor(CodeMirrorEditorPageModel, ({ model, key }) =>
      React.createElement(CodeMirrorEditorPageComponent, { model, key })
    );
    this.reactElementFactory.registerElementConstructor(GdbMiDebugConfigPageModel, ({ model, key }) =>
      React.createElement(GdbMiDebugConfigPageComponent, { model, key })
    );
    this.reactElementFactory.registerElementConstructor(DebugToolbarModel, ({ model, key }) =>
      React.createElement(DebugToolbarComponent, { model, key })
    );
    this.reactElementFactory.registerElementConstructor(NewDebugConfigDialogModel, ({ model, key }) =>
      React.createElement(NewDebugConfigDialogComponent, { model, key })
    );

    this.windowMenu = this.createWindowMenu();

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

    workspaceModel.createDefaultLayout({ mainPageSet, pageTree, debugToolbar });

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

    const fileMenu = menu.subMenu('File');
    fileMenu.separator();
    fileMenu.item('Exit');

    const viewMenu = menu.subMenu('View');
    const devToolsMenu = viewMenu.subMenu('Developer Tools');
    devToolsMenu.checkedItem('Electron', {
      isChecked: mobx.computed(() => this.devTools.isWindowOpen),
      action: item => {
        if (item.isChecked !== this.devTools.isWindowOpen) {
          item.isChecked ? this.devTools.open() : this.devTools.close();
        }
      }
    });
    devToolsMenu.checkedItem('Mobx', { isChecked: true, isEnabled: false });

    menu.resync();
    return menu;
  }
}
