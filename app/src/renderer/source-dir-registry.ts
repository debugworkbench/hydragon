// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as mobx from 'mobx';
import * as ipc from '../common/ipc/source-dir-registry';

/**
 * Provides access to the list of all currently open source directories.
 *
 * The list of source directories is actually managed by [[SourceDirRegistry]] in the main process,
 * so to modify the list from a renderer process execute an [[OpenSourceDirCommand]].
 */
export class RendererSourceDirRegistry {
  /** Observable list of currently open source directories. */
  @mobx.observable
  dirPaths: string[];

  private _isConnected: boolean;

  constructor() {
    this.dirPaths = [];
    this._isConnected = false;

    this._onDidUpdate = this._onDidUpdate.bind(this);

    ipcRenderer.once(ipc.IPC_CONNECT,
      (event: GitHubElectron.IRendererIPCEvent, response: ipc.IConnectResponse) =>
      this._onDidConnect(response.dirPaths)
    );
    ipcRenderer.send(ipc.IPC_CONNECT);
  }

  dispose(): void {
    if (this._isConnected) {
      ipcRenderer.removeListener(ipc.IPC_UPDATE, this._onDidUpdate);
      ipcRenderer.send(ipc.IPC_DISCONNECT);
    }
  }

  private _onDidConnect(dirPaths: string[]): void {
    this._isConnected = true;
    this.dirPaths = dirPaths;
    ipcRenderer.on(ipc.IPC_UPDATE, this._onDidUpdate);
  }

  private _onDidUpdate(event: GitHubElectron.IRendererIPCEvent, request: ipc.IUpdateRequest): void {
    switch (request.kind) {
      case 'add':
        this.dirPaths.push(...request.dirPaths);
        break;
      default:
        throw new Error('Malformed request.');
    }
  }
}
