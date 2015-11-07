// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as remote from 'remote';
import ElementFactory from './elements/element-factory';

/**
 * Singleton that provides access to all core Debug Workbench functionality.
 */
export default class RendererContext {
  /** Create the renderer context for the current process. */
  static create(): Promise<RendererContext> {
    return Promise.resolve()
    .then(() => {
      const newContext = new RendererContext();
      (<any> global).debugWorkbench = newContext;
      return newContext.initialize();
    })
    .then(() => (<any> global).debugWorkbench);
  }

  /** Get the renderer context for the current process. */
  static get(): RendererContext {
    return (<any> global).debugWorkbench;
  }

  elementFactory: ElementFactory;

  constructor() {
    this.elementFactory = new ElementFactory();
  }

  initialize(): Promise<void> {
    return this.elementFactory.initialize();
  }

  showWindow(): void {
    remote.getCurrentWindow().show();
  }
}
