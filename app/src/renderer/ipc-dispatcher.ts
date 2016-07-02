// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import {
  ipcChannels, isSimpleMessage, isRequest, MessageKind,
  IConnectMessage, IDisconnectMessage, IMessage, ISimpleMessage, IRequest, IResponse, IErrorResponse
} from '../common/ipc/ipc-node';

export type MessageCallback<TMessage> = (message: TMessage) => void;
export type RequestCallback<TRequest, TResponse> = (request: TRequest) => Promise<TResponse>;

export interface IRendererDispatcherNode {
  id: number;
  /** Read-only list of keys the node is currently subscribed to. */
  keys: string[];
  /** Should be called when the node is no longer needed. */
  dispose(): void;
  /**
   * Sets a function to be called when a remote node sends a message matching the given key and
   * channel.
   *
   * @param callback
   */
  onMessage<TMessage>(
    key: string, channel: string, callback: null | MessageCallback<TMessage>
  ): void;
  /**
   * @param callback
   */
  onRequest<TRequest, TResponse>(
    key: string, channel: string, callback: null | RequestCallback<TRequest, TResponse>
  ): void;
}

type NodeCallback = MessageCallback<any> | RequestCallback<any, any>;

class Node implements IRendererDispatcherNode {
  private _keyChannels = new Array<[/*key:*/string, Map</*channel:*/string, NodeCallback>]>();

  get keys(): string[] {
    return this._keyChannels.map(([key]) => key);
  }

  constructor(
    public id: number,
    private _sub: (key: string, node: Node) => void,
    private _unsub: (key: string, node: Node) => void
  ) {
  }

  dispose(): void {
    for (let [key] of this._keyChannels) {
      this._unsub(key, this);
    }
    this._keyChannels = null;
  }

  onMessage<TMessage>(
    key: string, channel: string, callback: null | MessageCallback<TMessage>
  ): void {
    for (let i = 0; i < this._keyChannels.length; ++i) {
      const [currentKey, channelToCallbackMap] = this._keyChannels[i];
      if (currentKey === key) {
        if (callback) {
          channelToCallbackMap.set(channel, callback);
        } else {
          if (channelToCallbackMap.size > 1) {
            channelToCallbackMap.delete(channel);
          } else {
            // no callbacks left for this key so unsubscribe from it entirely
            this._keyChannels.splice(i, 1);
            this._unsub(key, this);
          }
        }
        return;
      }
    }
    this._keyChannels.push([key, new Map([[channel, callback]])]);
    this._sub(key, this);
  }

  onRequest<TRequest, TResponse>(
    key: string, channel: string, callback: null | RequestCallback<TRequest, TResponse>
  ): void {
    this.onMessage(key, channel, callback);
  }

  handleMessage(key: string, channel: string, msg: any): void {
    for (let [k, channelMap] of this._keyChannels) {
      if (k === key) {
        const callback = channelMap.get(channel);
        if (callback) {
          callback(msg);
          return;
        }
        break;
      }
    }
  }

  handleRequest(key: string, channel: string, request: any): Promise<any> {
    for (let [k, channelMap] of this._keyChannels) {
      if (k === key) {
        const callback = channelMap.get(channel);
        if (callback) {
          const result = callback(request);
          if (result instanceof Promise) {
            return result;
          } else {
            throw new Error(`Request handler for '${key}:${channel}' didn't return a Promise.`);
          }
        }
        break;
      }
    }
  }
}

/**
 * Listens for messages sent by the main process and routes them to nodes in the renderer process.
 *
 * Each renderer process can have at most one dispatcher.
 * See also [[MainIPCDispatcher]].
 */
export class RendererIPCDispatcher {
  private _keyToNodesMap = new Map</*key:*/string, Array<Node>>();
  private _nextNodeId = 1;

  constructor() {
    this._subscribeNode = this._subscribeNode.bind(this);
    this._unsubscribeNode = this._unsubscribeNode.bind(this);
    this._onMessage = this._onMessage.bind(this);

    ipcRenderer.on(ipcChannels.MESSAGE, this._onMessage);
  }

  dispose(): void {
    ipcRenderer.removeListener(ipcChannels.MESSAGE, this._onMessage);
  }

  private _generateNodeId(): number {
    if (this._nextNodeId === Number.MAX_SAFE_INTEGER) {
      this._nextNodeId = 1;
    }
    return this._nextNodeId++;
  }

  /**
   * Create a new local node that can receive messages and respond to requests from remote nodes.
   */
  createNode(): IRendererDispatcherNode {
    return new Node(this._generateNodeId(), this._subscribeNode, this._unsubscribeNode);
  }

  private _subscribeNode(key: string, node: Node): void {
    const nodes = this._keyToNodesMap.get(key);
    if (nodes) {
      nodes.push(node);
    } else {
      this._keyToNodesMap.set(key, [node]);
    }
    // notify the dispatcher in the main process
    const request: IConnectMessage = { nodeId: node.id, key };
    ipcRenderer.send(ipcChannels.CONNECT, request);
  }

  private _unsubscribeNode(key: string, node: Node): void {
    const nodes = this._keyToNodesMap.get(key);
    if (nodes) {
      if (nodes.length > 1) {
        const idx = nodes.indexOf(node);
        if (idx !== -1) {
          nodes.splice(idx, 1);
        } else {
          throw new Error(`The node isn't subscribed to the ${key} key.`);
        }
      } else {
        this._keyToNodesMap.delete(key);
      }
    }
    // notify the dispatcher in the main process
    const msg: IDisconnectMessage = { nodeId: node.id, key };
    ipcRenderer.send(ipcChannels.DISCONNECT, msg);
  }

  private _onMessage(e: GitHubElectron.IRendererIPCEvent, msg: IMessage): void {
    if (isSimpleMessage(msg) || isRequest(msg)) {
      const nodes = this._keyToNodesMap.get(msg.key);
      if (!nodes) {
        throw new Error(`No nodes are registered for the '${msg.key}' key.`);
      }

      if (isSimpleMessage(msg)) {
        for (const node of nodes) {
          node.handleMessage(msg.key, msg.channel, msg.payload);
        }
      } else if (isRequest(msg)) {
        for (const node of nodes) {
          this._handleRequest(node, msg);
        }
      }
    }
  }

  private _handleRequest(node: Node, msg: IRequest): void {
    node.handleRequest(msg.key, msg.channel, msg.payload).then(response => {
      const responseMsg: IResponse = {
        kind: MessageKind.Response,
        requestId: msg.id,
        payload: response
      };
      ipcRenderer.send(ipcChannels.MESSAGE, responseMsg);
    }).catch((error: Error) => {
      const errorMsg: IErrorResponse = {
        kind: MessageKind.Error,
        key: msg.key,
        channel: msg.channel,
        requestId: msg.id,
        name: error.name,
        message: error.message,
        stack: error.stack
      };
      ipcRenderer.send(ipcChannels.MESSAGE, errorMsg);
    });
  }
}
