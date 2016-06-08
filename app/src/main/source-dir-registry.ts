// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import * as ipc from '../common/ipc/source-dir-registry';

/**
 * Maintains a list of all currently open source directories.
 *
 * The list of source directories can be accessed in the renderer process via
 * [[RendererSourceDirRegistry]]. Any changes made to the list of source directories in
 * [[SourceDirRegistry]] will be propagated to all [[RendererSourceDirRegistry]] instances.
 */
export class SourceDirRegistry {
  /** Absolute paths to source directories. */
  private _dirPaths: string[] = [];
  /** Hosts of all remote [[RendererSourceDirRegistry]] instances. */
  private _subscribers = new Set<GitHubElectron.WebContents>();

  constructor() {
    this._onConnectRequest = this._onConnectRequest.bind(this);
    ipcMain.on(ipc.IPC_CONNECT, this._onConnectRequest);
  }

  dispose(): void {
    ipcMain.removeListener(ipc.IPC_CONNECT, this._onConnectRequest);
    this._subscribers.clear();
  }

  add(...sourceDirPaths: string[]): void {
    this._dirPaths.push(...sourceDirPaths);
    const request: ipc.IUpdateRequest = { kind: 'add', dirPaths: sourceDirPaths };
    this._subscribers.forEach(subscriber => subscriber.send(ipc.IPC_UPDATE, request));
  }

  private _onConnectRequest(event: GitHubElectron.IMainIPCEvent): void {
    const webContents = event.sender;

    if (this._subscribers.has(webContents)) {
      throw new Error(`Subscriber is already connected.`);
    }
    this._subscribers.add(webContents);
    ipcMain.once(ipc.IPC_DISCONNECT, (event: GitHubElectron.IMainIPCEvent) => {
      this._subscribers.delete(event.sender);
    });
    const response: ipc.IConnectResponse = {
      dirPaths: this._dirPaths
    };
    webContents.send(ipc.IPC_CONNECT, response);
  }
}
