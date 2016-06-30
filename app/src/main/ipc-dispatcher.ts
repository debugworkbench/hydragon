// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import {
  IPC_CONNECT, IPC_DISCONNECT, IPC_MESSAGE, ISimpleMessage, IRequest, MessageKind, IConnectMessage,
  IDisconnectMessage, IMessage, IResponse
} from '../common/ipc/ipc-node';

interface IPendingRequest {
  id: number;
  onResponse<T>(response: T): void;
  cancel(): void;
}

export type MessageCallback = (msg: any) => Promise<any> | void;

export interface INode {
  keys: { [key: string]: { [channel: string]: MessageCallback } };
  onConnect?: (key: string, node: IRemoteNode) => void;
  onDisconnect?: (key: string, remoteNodeId: number) => void;
}

export interface IRemoteNode {
  id: number;
  keys: { [key: string]: Array<string> };
  page: GitHubElectron.WebContents;
}

/**
 * Sends requests and messages to nodes that live in one or more renderer processes.
 *
 * A request is expected to return a response, whereas a message is not.
 */
export class MainIPCDispatcher {
  private _keyToChannelsMap = new Map</*key:*/string, Map</*channel:*/string, Array<[GitHubElectron.WebContents, number]>>>();
  private _keyToNodesMap = new Map</*key:*/string, Array<INode>>();
  private _pendingRequests: IPendingRequest[] = [];
  private _nextRequestId = 1;
  private _defaultTimeOut = 60000; // 1 minute

  constructor() {
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onResponse = this._onResponse.bind(this);

    ipcMain.on(IPC_CONNECT, this._onConnect);
    ipcMain.on(IPC_DISCONNECT, this._onDisconnect);
    ipcMain.on(IPC_MESSAGE, this._onResponse);
  }

  dispose(): void {
    this._pendingRequests.forEach(request => request.cancel());

    ipcMain.removeListener(IPC_CONNECT, this._onConnect);
    ipcMain.removeListener(IPC_DISCONNECT, this._onDisconnect);
    ipcMain.removeListener(IPC_MESSAGE, this._onResponse);
  }

  /**
   * @return A callback that can be invoked to unregister the node.
   */
  registerNode(node: INode): MainIPCDispatcher.UnregisterNodeCallback {
    for (const key of Object.keys(node.keys)) {
      const nodes = this._keyToNodesMap.get(key);
      if (nodes) {
        nodes.push(node);
      } else {
        this._keyToNodesMap.set(key, [node]);
      }
    }
    return () => this._unregisterNode(node);
  }

  private _unregisterNode(node: INode): void {
    for (const key of Object.keys(node.keys)) {
      const nodes = this._keyToNodesMap.get(key);
      if (nodes.length > 1) {
        nodes.splice(nodes.indexOf(node), 1);
      } else {
        this._keyToNodesMap.delete(key);
      }
    }
  }

  /** Send a message to multiple remote nodes. */
  broadcastMessage<T>(key: string, channel: string, payload: T): void {
    const channelToPagesMap = this._keyToChannelsMap.get(key);
    const pages = channelToPagesMap.get(channel);
    for (const [page, nodeCount] of pages) {
      const msg: ISimpleMessage = { key, channel, kind: MessageKind.Simple, payload };
      page.send(IPC_MESSAGE, msg);
    }
  }

  /**
   * Send a message to a remote node.
   *
   * @param node The remote node the message should be sent to.
   * @param channel The channel the message should be sent on.
   * @param payload Arbitrary JSON serializable data.
   */
  sendMessage<T>(node: IRemoteNode, key: string, channel: string, payload: T): void {
    const msg: ISimpleMessage = {
      nodeId: node.id, key, channel, kind: MessageKind.Simple, payload
    };
    node.page.send(IPC_MESSAGE, msg);
  }

  /** Send a request to a remote node and return the response. */
  sendRequest<TRequest, TResponse>(key: string, channel: string, payload: TRequest): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      const channelToPagesMap = this._keyToChannelsMap.get(key);
      if (!channelToPagesMap) {
        throw new Error(`No nodes are registered for the '${key}' key.`);
      }

      const pages = channelToPagesMap.get(channel);
      if (!pages) {
        throw new Error(`No nodes are registered for the '${channel}' channel.`);
      }

      const page = pages[pages.length - 1][0];
      const requestId = this._generateRequestId();
      const timeoutTimer = setTimeout(() => {
        const idx = this._pendingRequests.findIndex(request => request.id === requestId);
        if (idx !== -1) {
          this._pendingRequests.splice(idx, 1);
        }
        reject(new Error('Request timed out'));
      }, this._defaultTimeOut);

      this._pendingRequests.push({
        id: requestId,
        onResponse: (response: TResponse) => {
          clearTimeout(timeoutTimer);
          resolve(response);
        },
        cancel: () => {
          clearTimeout(timeoutTimer);
          const idx = this._pendingRequests.findIndex(request => request.id === requestId);
          if (idx !== -1) {
            this._pendingRequests.splice(idx, 1);
          }
          reject(new Error('Request cancelled'));
        }
      });

      const msg: IRequest = { key, channel, id: requestId, kind: MessageKind.Request, payload };
      page.send(IPC_MESSAGE, msg);
    });
  }

  private _onConnect(e: GitHubElectron.IMainIPCEvent, request: IConnectMessage): void {
    const remoteNode: IRemoteNode = {
      id: request.nodeId,
      keys: request.keys,
      page: e.sender
    };
    for (const key of Object.keys(remoteNode.keys)) {
      const channelToPagesMap = this._keyToChannelsMap.get(key) || new Map<string, Array<[GitHubElectron.WebContents, number]>>();
      for (const channel of remoteNode.keys[key]) {
        const pages = channelToPagesMap.get(channel);
        if (pages) {
          for (let i = 0; i < pages.length; ++i) {
            if (pages[i][0] === remoteNode.page) {
              const page = pages[i];
              if (page) {
                ++page[1];
              } else {
                pages.push([remoteNode.page, 1]);
              }
              break;
            }
          }
        } else {
          channelToPagesMap.set(channel, [[remoteNode.page, 1]]);
        }
      }
      this._keyToChannelsMap.set(key, channelToPagesMap);

      const nodes = this._keyToNodesMap.get(key);
      if (nodes) {
        for (const node of nodes) {
          if (node.onConnect) {
            node.onConnect(key, remoteNode);
          }
        }
      }
    }
  }

  private _onDisconnect(e: GitHubElectron.IMainIPCEvent, msg: IDisconnectMessage): void {
    for (const key of Object.keys(msg.keys)) {
      const channelToPagesMap = this._keyToChannelsMap.get(key);
      for (const channel of msg.keys[key]) {
        const pages = channelToPagesMap.get(channel);
        for (let i = 0; i < pages.length; ++i) {
          if (pages[i][0] === e.sender) {
            const [page, nodeCount] = pages[i];
            if (nodeCount > 1) {
              pages[i][1] = nodeCount - 1;
            } else if (pages.length > 1) {
              pages.splice(i, 1);
            } else {
              channelToPagesMap.delete(channel);
            }
            break;
          }
        }
      }

      const nodes = this._keyToNodesMap.get(key);
      if (nodes) {
        for (const node of nodes) {
          if (node.onDisconnect) {
            node.onDisconnect(key, msg.nodeId);
          }
        }
      }
    }
  }

  private _onResponse(e: GitHubElectron.IMainIPCEvent, response: IResponse): void {
    for (let i = 0; i < this._pendingRequests.length; ++i) {
      const request = this._pendingRequests[i];
      if (request.id === response.requestId) {
        this._pendingRequests.splice(i, 1);
        request.onResponse(response.payload);
      }
    }
  }

  private _generateRequestId(): number {
    // ASSUMPTION: by the time the next request id hits MAX_SAFE_INTEGER it's reasonably safe to
    // start reusing previously issued request ids from the start of the [0, MAX_SAFE_INTEGER] range
    if (this._nextRequestId === Number.MAX_SAFE_INTEGER) {
      this._nextRequestId = 1;
    }
    return this._nextRequestId++;
  }
}

export namespace MainIPCDispatcher {
  export type UnregisterNodeCallback = () => void;
}
