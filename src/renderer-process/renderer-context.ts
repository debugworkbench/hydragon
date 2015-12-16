// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as remote from 'remote';
import ElementRegistry from './elements/element-registry';
import ElementFactory from './elements/element-factory';
import { IWorkspaceElement } from './elements/workspace/workspace';
import { importHref } from './utils';
import { IAppWindowConfig } from '../common/app-window-config';

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
  workspace: IWorkspaceElement;

  /** Create the renderer context for the current process. */
  static async create(config: IAppWindowConfig): Promise<RendererContext> {
    const newContext = new RendererContext(config);
    (<any> global).debugWorkbench = newContext;
    await newContext.initialize();
    return newContext;
  }

  /** Get the renderer context for the current process. */
  static get(): RendererContext {
    return (<any> global).debugWorkbench;
  }

  constructor() {
    this.elementRegistry = new ElementRegistry();
    this.elementRegistry.addElementPath(
      'debug-workbench-workspace', path.posix.join('lib/renderer-process/elements/workspace', 'workspace.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-panel', path.posix.join('lib/renderer-process/elements/panel', 'panel.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-horizontal-container',
      path.posix.join('lib/renderer-process/elements/horizontal-container', 'horizontal-container.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-vertical-container',
      path.posix.join('lib/renderer-process/elements/vertical-container', 'vertical-container.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-splitter', path.posix.join('lib/renderer-process/elements/splitter', 'splitter.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-page', path.posix.join('lib/renderer-process/elements/pages', 'page.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-page-set', path.posix.join('lib/renderer-process/elements/pages', 'page-set.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-page-tree', path.posix.join('lib/renderer-process/elements/pages', 'page-tree.html')
    );
    this.elementRegistry.addElementPath(
      'debug-workbench-page-tree-item', path.posix.join('lib/renderer-process/elements/pages', 'page-tree-item.html')
    );
    this.elementRegistry.addElementPath(
      'code-mirror-editor', path.posix.join('lib/renderer-process/elements/code-mirror-editor', 'code-mirror-editor.html')
    );
    this.elementRegistry.addElementPath(
      'hydragon-tree-view', path.posix.join('lib/renderer-process/elements/tree-view', 'tree-view.html')
    );
    this.elementRegistry.addElementPath(
      'hydragon-directory-tree-view', path.posix.join('lib/renderer-process/elements/tree-view', 'directory-tree-view.html')
    );
    this.elementRegistry.addElementPath(
      'hydragon-directory-tree-view-item', path.posix.join('lib/renderer-process/elements/tree-view', 'directory-tree-view-item.html')
    );
  }

  async initialize(): Promise<void> {
    await importHref('app://bower_components/dependencies_bundle.html');
    await this.elementRegistry.initialize();
    this.elementFactory = new ElementFactory(this.elementRegistry);
    this.workspace = this.elementFactory.createWorkspace();
    document.body.appendChild(this.workspace);
  }

  showWindow(): void {
    remote.getCurrentWindow().show();
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
      document.body.removeChild(this._cursorOverlay);
    }
  }
}
