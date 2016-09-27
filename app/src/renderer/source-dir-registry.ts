// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import * as ipc from '../common/ipc/source-dir-registry';
import { PROJECT_IPC_KEY } from '../common/ipc/keys';
import { RendererIPCDispatcher, IRendererDispatcherNode } from './ipc-dispatcher';

/**
 * Provides access to the list of all currently open source directories.
 *
 * The list of source directories is actually managed by [[SourceDirRegistry]] in the main process,
 * so to modify the list from a renderer process execute an [[OpenSourceDirCommand]].
 */
export class RendererSourceDirRegistry {
  /** Observable list of currently open source directories. */
  @mobx.observable
  dirPaths: string[] = [];

  private _id: number;
  private _ipcDispatcher: RendererIPCDispatcher;
  private _dispatcherNode: IRendererDispatcherNode;

  constructor(ipcDispatcher: RendererIPCDispatcher) {
    this._ipcDispatcher = ipcDispatcher;

    this._onSync = this._onSync.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this._dispatcherNode = this._ipcDispatcher.createNode();
    this._dispatcherNode.onMessage(PROJECT_IPC_KEY, ipc.IPC_SYNC, this._onSync);
    this._dispatcherNode.onMessage(PROJECT_IPC_KEY, ipc.IPC_UPDATE, this._onUpdate);
  }

  dispose(): void {
    if (this._dispatcherNode) {
      this._dispatcherNode.dispose();
      this._dispatcherNode = null;
    }
    this._ipcDispatcher = null;
  }

  private _onSync(msg: ipc.ISyncMessage): void {
    // Assigning a new array to an observable property seems to create a new observable array
    // rather than replacing the contents of the old observable array, which means that a React
    // component that observes this array will not re-render, which is somewhat unexpected
    // behavior. To ensure components are always re-rendered use replace() instead of assignment.
    if (mobx.isObservableArray(this.dirPaths)) {
      this.dirPaths.replace(msg.dirPaths);
    }
  }

  private _onUpdate(msg: ipc.IUpdateMessage): void {
    switch (msg.kind) {
      case 'add':
        this.dirPaths.push(...msg.dirPaths);
        break;
      default:
        throw new Error('Malformed message.');
    }
  }
}
