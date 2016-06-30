// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import {
  IPC_CONNECT, IPC_DISCONNECT, IPC_MESSAGE, isSimpleMessage, isRequest, MessageKind,
  IConnectMessage, IDisconnectMessage, IMessage, ISimpleMessage, IRequest, IResponse, IErrorResponse
} from '../common/ipc/ipc-node';

export type MessageCallback = (msg: any) => Promise<any> | void;

export interface INodeOptions {
  keys: { [key: string]: { [channel: string]: MessageCallback } };
}

export interface INode extends INodeOptions {
  id: number;
}

interface IKeyToChannelsMap {
  [key: string]: Array<string>;
}

/**
 * Listens for messages sent by the main process and routes them to nodes in the renderer process.
 *
 * Each renderer process can have at most one dispatcher.
 */
export class RendererIPCDispatcher {
  private _keyToChannelsMap = new Map</*key:*/string, Map</*channel:*/string, Set<INode>>>();
  private _nextNodeId = 1;

  constructor() {
    this._onMessage = this._onMessage.bind(this);
    ipcRenderer.on(IPC_MESSAGE, this._onMessage);
  }

  dispose(): void {
    ipcRenderer.removeListener(IPC_MESSAGE, this._onMessage);
  }

  private _generateNodeId(): number {
    if (this._nextNodeId === Number.MAX_SAFE_INTEGER) {
      this._nextNodeId = 1;
    }
    return this._nextNodeId++;
  }

  /**
   * @return A callback that can be invoked to unregister the node.
   */
  registerNode(options: INodeOptions): RendererIPCDispatcher.UnregisterNodeCallback {
    const node: INode = Object.assign({}, options, { id: this._generateNodeId() });
    for (const key of Object.keys(node.keys)) {
      const channelToNodesMap = this._keyToChannelsMap.get(key) || new Map<string, Set<INode>>();
      for (const channel of Object.keys(node.keys[key])) {
        const nodes = channelToNodesMap.get(channel);
        if (nodes) {
          nodes.add(node);
        } else {
          channelToNodesMap.set(channel, new Set<INode>([node]));
        }
      }
      this._keyToChannelsMap.set(key, channelToNodesMap);
    }
    // notify the dispatcher in the main process
    const keyToChannelsMap: { [key: string]: Array<string> } = Object.create(null);
    Object.keys(node.keys).forEach(key => keyToChannelsMap[key] = Object.keys(node.keys[key]));
    const request: IConnectMessage = { nodeId: node.id, keys: keyToChannelsMap };
    ipcRenderer.send(IPC_CONNECT, request);
    return () => this._unregisterNode(request.nodeId, node, keyToChannelsMap);
  }

  private _unregisterNode(nodeId: number, node: INode, keyToChannelsMap: IKeyToChannelsMap): void {
    for (const key of Object.keys(node.keys)) {
      const channelToNodesMap = this._keyToChannelsMap.get(key);
      for (const channel of Object.keys(node.keys[key])) {
        const nodes = channelToNodesMap.get(channel);
        if (nodes.size > 1) {
          nodes.delete(node);
        } else if (channelToNodesMap.size > 1) {
          channelToNodesMap.delete(channel);
        } else {
          this._keyToChannelsMap.delete(key);
        }
      }
    }
    // notify the dispatcher in the main process
    const msg: IDisconnectMessage = { nodeId, keys: keyToChannelsMap };
    ipcRenderer.send(IPC_DISCONNECT, msg);
  }

  private _onMessage(e: GitHubElectron.IRendererIPCEvent, msg: IMessage): void {
    if (isSimpleMessage(msg) || isRequest(msg)) {
      const channelToNodesMap = this._keyToChannelsMap.get(msg.key);
      if (!channelToNodesMap) {
        throw new Error(`No nodes are registered for the '${msg.key}' key.`);
      }

      const nodes = channelToNodesMap.get(msg.channel);
      if (!nodes) {
        throw new Error(`No nodes are registered for the '${msg.channel}' channel.`);
      }

      for (const node of nodes) {
        this._dispatchMessageToNode(node, msg);
      }
    }
  }

  private _dispatchMessageToNode(node: INode, msg: ISimpleMessage | IRequest): void {
    const handleMessage = node.keys[msg.key][msg.channel];
    if (!handleMessage) {
      return;
    }

    const retVal = handleMessage(msg.payload);
    if (isRequest(msg)) {
      if (retVal instanceof Promise) {
        const requestId = msg.id;
        retVal
        .then(response => {
          const responseMsg: IResponse = {
            kind: MessageKind.Response,
            requestId,
            payload: response
          };
          ipcRenderer.send(IPC_MESSAGE, responseMsg);
        })
        .catch((error: Error) => {
          const errorMsg: IErrorResponse = {
            kind: MessageKind.Error,
            key: msg.key,
            channel: msg.channel,
            requestId,
            name: error.name,
            message: error.message,
            stack: error.stack
          };
          ipcRenderer.send(IPC_MESSAGE, errorMsg);
        });
      } else {
        throw new Error(
          `Request handler for '${msg.key}:${msg.channel}' failed to provide a response.`
        );
      }
    }
  }
}

export namespace RendererIPCDispatcher {
  export type UnregisterNodeCallback = () => void;
}
