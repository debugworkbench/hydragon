// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow } from 'electron';
import * as DevTools from '../common/dev-tools';

export function register(): void {
  ipcMain.on(DevTools.IPC_INSPECT_ELEMENT, (event, { x = 0, y = 0 }) => {
    BrowserWindow.getFocusedWindow().inspectElement(x, y);
  });
}
