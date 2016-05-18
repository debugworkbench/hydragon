// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as DevTools from '../common/dev-tools';

export function register(): void {
  window.addEventListener('contextmenu', event => {
    event.preventDefault();
    ipcRenderer.send(DevTools.IPC_INSPECT_ELEMENT, { x: event.x, y: event.y });
  });
}
