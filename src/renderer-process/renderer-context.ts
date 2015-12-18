// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as electron from 'electron';
import ElementRegistry, { ElementManifestLoader } from './elements/element-registry';
import ElementFactory from './elements/element-factory';
import { IWorkspaceElement } from './elements/workspace/workspace';
import { importHref } from './utils';
import UriPathResolver from '../common/uri-path-resolver';
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
  rootPath: string;

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

  constructor(config: IAppWindowConfig) {
    this.rootPath = config.rootPath;
  }

  async initialize(): Promise<void> {
    await importHref('app:///bower_components/dependencies_bundle.html');
    const uriPathResolver = new UriPathResolver(this.rootPath);
    const elementManifestLoader = new ElementManifestLoader(uriPathResolver);
    this.elementRegistry = new ElementRegistry(uriPathResolver, elementManifestLoader);
    await this.elementRegistry.importManifestFromUri('app:///static/core-elements-manifest.json');
    this.elementFactory = new ElementFactory(this.elementRegistry);
    this.workspace = this.elementFactory.createWorkspace();
    document.body.appendChild(this.workspace);
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
      document.body.removeChild(this._cursorOverlay);
    }
  }
}
