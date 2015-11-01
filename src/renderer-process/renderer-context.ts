// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as remote from 'remote';

/**
 * Singleton that provides access to all core Debug Workbench functionality.
 */
export default class RendererContext {
  /** Set the renderer context for the current process. */
  static set(context: RendererContext): void {
    (<any> global).debugWorkbench = context;
  }

  /** Get the renderer context for the current process. */
  static get(): RendererContext {
    return (<any> global).debugWorkbench;
  }

  showWindow(): void {
    remote.getCurrentWindow().show();
  }
}
