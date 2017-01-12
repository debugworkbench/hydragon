// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable } from '@reactivex/rxjs';
import { WidgetEvent, IWindow } from './widgets';
import { WidgetPatch } from './patch';
export * from './widgets';
export * from './presentations';
export * from './presenter';
export * from './output-record';
export * from './command-table';
export * from './patch';

export interface IDisplayServer {
  /** Stream that emits widget events (which are usually generated in respose to user input). */
  readonly eventStream: Observable<WidgetEvent>;
  /** Creates a new window on the display server from the given generic window description. */
  createWindow(win: IWindow): void;
  /** Applies a set of changes to the given window. */
  updateWindow(win: IWindow, patch: WidgetPatch): void;
};
