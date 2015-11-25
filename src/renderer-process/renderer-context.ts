// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as remote from 'remote';
import { ElementFactory } from './elements/element-factory';
// NOTE: WorkspaceElement must be lazy-loaded (see intialize() for more info).
import * as WorkspaceModule from './elements/workspace/workspace';
import { importHref } from './utils';

export const enum Cursor {
  HorizontalResize,
  VerticalResize
}

/**
 * Singleton that provides access to all core Debug Workbench functionality.
 */
export class RendererContext {
  private _cursorOverlay: HTMLElement;

  elementFactory: ElementFactory;
  workspace: WorkspaceModule.IWorkspaceElement;

  /** Create the renderer context for the current process. */
  static async create(): Promise<RendererContext> {
    const newContext = new RendererContext();
    (<any> global).debugWorkbench = newContext;
    await newContext.initialize();
    return newContext;
  }

  /** Get the renderer context for the current process. */
  static get(): RendererContext {
    return (<any> global).debugWorkbench;
  }

  constructor() {
    this.elementFactory = new ElementFactory();
    this.elementFactory.addElementPath(
      'debug-workbench-workspace', path.posix.join('lib/renderer-process/elements/workspace', 'workspace.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-panel', path.posix.join('lib/renderer-process/elements/panel', 'panel.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-horizontal-container',
      path.posix.join('lib/renderer-process/elements/horizontal-container', 'horizontal-container.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-vertical-container',
      path.posix.join('lib/renderer-process/elements/vertical-container', 'vertical-container.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-splitter', path.posix.join('lib/renderer-process/elements/splitter', 'splitter.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-page', path.posix.join('lib/renderer-process/elements/pages', 'page.html')
    );
    this.elementFactory.addElementPath(
      'debug-workbench-page-set', path.posix.join('lib/renderer-process/elements/pages', 'page-set.html')
    );
    this.elementFactory.addElementPath(
      'code-mirror-editor', path.posix.join('lib/renderer-process/elements/code-mirror-editor', 'code-mirror-editor.html')
    );
  }

  async initialize(): Promise<void> {
    await importHref('app://bower_components/dependencies_bundle.html');
    await this.elementFactory.initialize();
    // WorkspaceElement can't be required until the Polymer dependencies have been loaded,
    // if it's required on import then the decorators that apply behaviors won't work as
    // expected because the Polymer behaviors haven't been loaded yet at that point and
    // you'll end up with undefined behaviors in WorkspaceElement.prototype.behaviors.
    const workspace: typeof WorkspaceModule = require('./elements/workspace/workspace');
    this.workspace = workspace.WorkspaceElement.createSync();
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
