// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import * as ipc from '../common/ipc/source-dir-registry';
import { PROJECT_IPC_KEY } from '../common/ipc/keys';
import { MainIPCDispatcher, IMainDispatcherNode } from './ipc-dispatcher';

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
  private _ipcDispatcher: MainIPCDispatcher;
  private _dispatcherNode: IMainDispatcherNode;

  constructor(ipcDispatcher: MainIPCDispatcher) {
    this._ipcDispatcher = ipcDispatcher;
    this._dispatcherNode = ipcDispatcher.createNode();
    this._dispatcherNode.onConnect(PROJECT_IPC_KEY, (key, remoteNode) => {
      this._ipcDispatcher.sendMessage<ipc.ISyncMessage>(
        remoteNode, PROJECT_IPC_KEY, ipc.IPC_SYNC, { dirPaths: this._dirPaths }
      );
    });
  }

  dispose(): void {
    if (this._dispatcherNode) {
      this._dispatcherNode.dispose();
      this._dispatcherNode = null;
    }
    this._ipcDispatcher = null;
  }

  add(...sourceDirPaths: string[]): void {
    this._dirPaths.push(...sourceDirPaths);
    this._ipcDispatcher.broadcastMessage<ipc.IUpdateMessage>(
      PROJECT_IPC_KEY, ipc.IPC_UPDATE, { kind: 'add', dirPaths: sourceDirPaths }
    );
  }
}
