// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import {
  ipcChannels, isSimpleMessage, isRequest, isResponse, isErrorResponse, MessageKind,
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
   * Set a function to be called when another node sends a message using the given key and
   * channel.
   */
  onMessage<TMessage>(
    key: string, channel: string, callback: null | MessageCallback<TMessage>
  ): void;
  /**
   * Set a function to be called when another node sends a request using the given key and
   * channel. The function must return a promise that will eventually be resolved with the
   * response to the request.
   */
  onRequest<TRequest, TResponse>(
    key: string, channel: string, callback: null | RequestCallback<TRequest, TResponse>
  ): void;
}

type NodeCallback = MessageCallback<any> | RequestCallback<any, any>;

/**
 * Renderer-side dispatcher nodes can send messages and requests to other renderer-side and
 * browser-side dispatcher nodes via the dispatcher. They can also listen for messages and
 * requests from other nodes.
 */
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

  /**
   * Pass a message to the callback (if any) associated with the given key and channel.
   */
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

  /**
   * Pass a request to the callback (if any) associated with the given key and channel,
   * and return the result from the callback.
   */
  handleRequest(key: string, channel: string, request: any): Promise<any> {
    const callback = this.getRequestHandler(key, channel);
    if (callback) {
      const result = callback(request);
      if (result instanceof Promise) {
        return result;
      } else {
        throw new Error(`Request handler for '${key}:${channel}' didn't return a Promise.`);
      }
    }
  }

  /**
   * Return the request callback (if any) associated with the given key and channel.
   */
  getRequestHandler<TRequest, TResponse>(
    key: string, channel: string
  ): RequestCallback<TRequest, TResponse> | null {
    for (let [currentKey, channelMap] of this._keyChannels) {
      if (currentKey === key) {
        return <RequestCallback<TRequest, TResponse>> channelMap.get(channel);
      }
    }
  }
}

interface IPendingRequest {
  id: number;
  onResponse<TPayload>(response: TPayload): void;
  onError(error: { name: string, message: string, stack: string }): void;
  cancel(): void;
}

/**
 * Dispatches requests from in-process nodes to in-process and out-of-process nodes, and messages
 * and requests from out-of-process nodes to in-process nodes.
 *
 * Each renderer process can have at most one dispatcher.
 * See also [[MainIPCDispatcher]].
 */
export class RendererIPCDispatcher {
  private _keyToNodesMap = new Map</*key:*/string, Array<Node>>();
  private _nextNodeId = 1;
  private _pendingRequests: IPendingRequest[] = [];
  private _nextRequestId = 1;
  private _defaultTimeOut = 60000; // 1 minute

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

  private _generateRequestId(): number {
    // ASSUMPTION: by the time the next request id hits MAX_SAFE_INTEGER it's reasonably safe to
    // start reusing previously issued request ids from the start of the [0, MAX_SAFE_INTEGER] range
    if (this._nextRequestId === Number.MAX_SAFE_INTEGER) {
      this._nextRequestId = 1;
    }
    return this._nextRequestId++;
  }

  /**
   * Create a new in-process node that can handle messages and requests from other in-process and
   * out-of-process nodes.
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

  /** Send a request to another node and return the response. */
  sendRequest<TRequest, TResponse>(
    key: string, channel: string, payload: TRequest
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      // try to find an in-process node to handle the request
      const nodes = this._keyToNodesMap.get(key);
      if (nodes) {
        for (let node of nodes) {
          const handleRequest = node.getRequestHandler(key, channel);
          if (handleRequest) {
            const timeoutTimer = setTimeout(() => {
              reject(new Error('Request timed out'));
            }, this._defaultTimeOut);
            handleRequest(payload)
            .then((response: TResponse) => {
              clearTimeout(timeoutTimer);
              resolve(response);
            })
            .catch(err => {
              clearTimeout(timeoutTimer);
              reject(err);
            });
            return;
          }
        }
      }

      // if no in-process node could handle the request forward it onto the dispatcher in the main
      // process
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
        onError: (error: { name: string, message: string, stack: string }) => {
          clearTimeout(timeoutTimer);
          reject(error);
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
      ipcRenderer.send(ipcChannels.MESSAGE, msg);
    });
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
    } else if (isResponse(msg)) {
      for (let i = 0; i < this._pendingRequests.length; ++i) {
        const request = this._pendingRequests[i];
        if (request.id === msg.requestId) {
          this._pendingRequests.splice(i, 1);
          request.onResponse(msg.payload);
          break;
        }
      }
    } else if (isErrorResponse(msg)) {
      for (let i = 0; i < this._pendingRequests.length; ++i) {
        const request = this._pendingRequests[i];
        if (request.id === msg.requestId) {
          this._pendingRequests.splice(i, 1);
          request.onError({ name: msg.name, message: msg.message, stack: msg.stack });
          break;
        }
      }
    }
  }

  private _handleRequest(node: Node, msg: IRequest): void {
    node.handleRequest(msg.key, msg.channel, msg.payload)
    .then(response => {
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
