// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow } from 'electron';
import * as ipc from '../common/dev-tools-ipc';

/**
 * Allows Electron DevTools to be controlled from a renderer process via IPC.
 */
export class DevTools {
  constructor() {
    ipcMain.on(ipc.IPC_CONNECT, onConnectRequest);
    ipcMain.on(ipc.IPC_OPEN, onOpenRequest);
    ipcMain.on(ipc.IPC_CLOSE, onCloseRequest);
    ipcMain.on(ipc.IPC_INSPECT_ELEMENT, onInspectElementRequest);
    ipcMain.on(ipc.IPC_RELOAD_PAGE, onReloadPageRequest);
  }

  dispose(): void {
    ipcMain.removeListener(ipc.IPC_CONNECT, onConnectRequest);
    ipcMain.removeListener(ipc.IPC_OPEN, onOpenRequest);
    ipcMain.removeListener(ipc.IPC_CLOSE, onCloseRequest);
    ipcMain.removeListener(ipc.IPC_INSPECT_ELEMENT, onInspectElementRequest);
    ipcMain.removeListener(ipc.IPC_RELOAD_PAGE, onReloadPageRequest);
  }
}

function onConnectRequest(event: GitHubElectron.IMainIPCEvent): void {
  const webContents = event.sender;
  webContents.on('devtools-opened', onDidOpen);
  webContents.on('devtools-closed', onDidClose);
  webContents.once('destroyed', (event: GitHubElectron.IMainIPCEvent) => {
    event.sender.removeListener('devtools-opened', onDidOpen);
    event.sender.removeListener('devtools-closed', onDidClose);
  });
  const response: ipc.IConnectResponse = {
    isWindowOpen: webContents.isDevToolsOpened()
  };
  webContents.send(ipc.IPC_CONNECT, response);
}

function onOpenRequest(event: GitHubElectron.IMainIPCEvent): void {
  event.sender.openDevTools();
}

function onCloseRequest(event: GitHubElectron.IMainIPCEvent): void {
  event.sender.closeDevTools();
}

function onDidOpen(event: GitHubElectron.IMainIPCEvent): void {
  event.sender.send(ipc.IPC_DID_OPEN);
}

function onDidClose(event: GitHubElectron.IMainIPCEvent): void {
  event.sender.send(ipc.IPC_DID_CLOSE);
}

function onInspectElementRequest(
  event: GitHubElectron.IMainIPCEvent, request: ipc.IInspectElementRequest
): void {
  event.sender.inspectElement(request.x, request.y);
};

function onReloadPageRequest(event: GitHubElectron.IMainIPCEvent): void {
  event.sender.reload();
}
