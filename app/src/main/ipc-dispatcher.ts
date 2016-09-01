// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import {
  ipcChannels, ISimpleMessage, IRequest, IConnectMessage, IDisconnectMessage, IResponse,
  IErrorResponse, MessageKind, Message
} from '../common/ipc/ipc-node';

interface IPendingRequest {
  id: number;
  onResponse<T>(response: T): void;
  onError(error: { name: string, message: string, stack: string }): void;
  cancel(): void;
}

export type ConnectCallback = (key: string, remoteNode: IRemoteNode) => void;
export type DisconnectCallback = (key: string, remoteNodeId: number) => void;

export interface IMainDispatcherNode {
  /** Should be called when the node is no longer needed. */
  dispose(): void;
  /** Set a function to be called when a remote node subscribes to the specified key. */
  onConnect(key: string, callback: ConnectCallback): void;
  /** Set a function to be called when a remote node unsubscribes from the specified key. */
  onDisconnect(key: string, callback: DisconnectCallback): void;
}

export interface IRemoteNode {
  id: number;
  key: string;
  page: GitHubElectron.WebContents;
}

/**
 * Browser-side dispatcher nodes are notified when a renderer-side node connects or disconnects
 * with one or more keys, currently to ensure this works as expected the browser-side node must be
 * created before any of the renderer-side nodes it wishes to be notified about. A browser-side node
 * can send messages and requests to renderer-side nodes via the dispatcher, but browser-side nodes
 * cannot communicate with each other.
 */
class Node implements IMainDispatcherNode {
  private _keyCallbacks = new Array<[/*key:*/string, [ConnectCallback, DisconnectCallback]]>();

  constructor(
    private _sub: (key: string, node: Node) => void,
    private _unsub: (key: string, node: Node) => void
  ) {
  }

  dispose(): void {
    for (let [key] of this._keyCallbacks) {
      this._unsub(key, this);
    }
    this._keyCallbacks = null;
  }

  onConnect(key: string, connectCallback: null | ConnectCallback): void {
    // replace the previously set callback (if any)
    for (let i = 0; i < this._keyCallbacks.length; ++i) {
      if (this._keyCallbacks[i][0] === key) {
        const callbacks = this._keyCallbacks[i][1];
        const disconnectCallback = callbacks[1];
        // when both the connect and disconnect callbacks are set to null let the dispatcher know
        // that the node no longer needs to be notified about connection events for this key
        if ((connectCallback === null) && (disconnectCallback === null)) {
          this._unsub(key, this);
          this._keyCallbacks.splice(i, 1);
        } else {
          callbacks[0] = connectCallback;
        }
        return;
      }
    }
    this._keyCallbacks.push([key, [connectCallback, null]]);
    this._sub(key, this);
  }

  onDisconnect(key: string, disconnectCallback: null | DisconnectCallback): void {
    // replace the previously set callback (if any)
    for (let i = 0; i < this._keyCallbacks.length; ++i) {
      if (this._keyCallbacks[i][0] === key) {
        const callbacks = this._keyCallbacks[i][1];
        const connectCallback = callbacks[0];
        if ((disconnectCallback === null) && (connectCallback === null)) {
          this._unsub(key, this);
          this._keyCallbacks.splice(i, 1);
        } else {
          callbacks[1] = disconnectCallback;
        }
        return;
      }
    }
    this._keyCallbacks.push([key, [null, disconnectCallback]]);
    this._sub(key, this);
  }

  /** Invoke the connect callback associated with the given key (if any). */
  connect(key: string, node: IRemoteNode): void {
    for (let [currentKey, callbacks] of this._keyCallbacks) {
      if (currentKey === key) {
        if (callbacks[0]) {
          callbacks[0](key, node);
        }
        break;
      }
    }
  }

  /** Invoke the disconnect callback associated with the given key (if any). */
  disconnect(key: string, nodeId: number): void {
    for (let [currentKey, callbacks] of this._keyCallbacks) {
      if (currentKey === key) {
        if (callbacks[1]) {
          callbacks[1](key, nodeId);
        }
        break;
      }
    }
  }
}

/** Used to keep track of the number of remote nodes on a page. */
interface IPageInfo {
  /** Every page in Electron runs in its own renderer process. */
  page: GitHubElectron.WebContents;
  /** Each renderer process can contain multiple nodes. */
  remoteNodeCount: number;
}

/**
 * Dispatches requests and messages from in-process nodes to out-of-process nodes, and vice versa.
 *
 * A request is expected to return a response, whereas a message is not.
 * See also [[RendererIPCDispatcher]].
 */
export class MainIPCDispatcher {
  /** Tracks the number of remote nodes subscribed to each key on a per page basis. */
  private _keyToPagesMap = new Map</*key:*/string, Array<IPageInfo>>();
  /** Tracks the local nodes subscribed each key. */
  private _keyToNodesMap = new Map</*key:*/string, Array<Node>>();
  private _pendingRequests: IPendingRequest[] = [];
  private _nextRequestId = 1;
  private _defaultTimeOut = 60000; // 1 minute

  constructor() {
    this._subscribeNode = this._subscribeNode.bind(this);
    this._unsubscribeNode = this._unsubscribeNode.bind(this);
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onMessage = this._onMessage.bind(this);

    ipcMain.on(ipcChannels.CONNECT, this._onConnect);
    ipcMain.on(ipcChannels.DISCONNECT, this._onDisconnect);
    ipcMain.on(ipcChannels.MESSAGE, this._onMessage);
  }

  /**
   * Should be called when the dispatcher is no longer needed.
   * Any pending requests will be cancelled.
   */
  dispose(): void {
    this._pendingRequests.forEach(request => request.cancel());

    ipcMain.removeListener(ipcChannels.CONNECT, this._onConnect);
    ipcMain.removeListener(ipcChannels.DISCONNECT, this._onDisconnect);
    ipcMain.removeListener(ipcChannels.MESSAGE, this._onMessage);
  }

  /**
   * Create a new in-process node that can be notified when out-of-process nodes subscribe to or
   * unsubscribe from certain keys.
   */
  createNode(): IMainDispatcherNode {
    return new Node(this._subscribeNode, this._unsubscribeNode);
  }

  /** Called when an in-process node subscribes to a key. */
  private _subscribeNode(key: string, node: Node): void {
    const nodes = this._keyToNodesMap.get(key);
    if (nodes) {
      nodes.push(node);
    } else {
      this._keyToNodesMap.set(key, [node]);
    }
  }

  /** Called when an in-process node unsubscribes from a key. */
  private _unsubscribeNode(key: string, node: Node): void {
    const nodes = this._keyToNodesMap.get(key);
    if (nodes.length > 1) {
      nodes.splice(nodes.indexOf(node), 1);
    } else {
      this._keyToNodesMap.delete(key);
    }
  }

  /** Send a message to all out-of-process nodes subscribed to the given key. */
  broadcastMessage<T>(key: string, channel: string, payload: T): void {
    const pages = this._keyToPagesMap.get(key);
    for (const pageInfo of pages) {
      const msg: ISimpleMessage = { key, channel, kind: MessageKind.Simple, payload };
      pageInfo.page.send(ipcChannels.MESSAGE, msg);
    }
  }

  /**
   * Send a message to an out-of-process node.
   *
   * @param node The remote node the message should be sent to.
   * @param key The key to associate with the message.
   * @param channel The channel the message should be sent on.
   * @param payload Arbitrary JSON serializable data.
   */
  sendMessage<T>(node: IRemoteNode, key: string, channel: string, payload: T): void {
    const msg: ISimpleMessage = {
      nodeId: node.id, key, channel, kind: MessageKind.Simple, payload
    };
    node.page.send(ipcChannels.MESSAGE, msg);
  }

  /**
   * Send a request to an out-of-process node and return the response.
   *
   * @param sender The page the request originates from (if any), if provided the dispatcher will
   *               not send the request to the sender.
   */
  sendRequest<TRequest, TResponse>(
    key: string, channel: string, payload: TRequest, sender?: GitHubElectron.WebContents
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      let pages = this._keyToPagesMap.get(key);
      if (sender) {
        pages = pages.filter(pageInfo => pageInfo.page !== sender);
      }
      if (!pages || (pages.length === 0)) {
        throw new Error(`No remote nodes for the '${key}' key found.`);
      }
      // NOTE: for now just send the request to the first page that was added, first come first
      //       served, should probably provide a way to control this at some point
      const page = pages[0].page;
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
      page.send(ipcChannels.MESSAGE, msg);
    });
  }

  /**
   * Called when an out-of-process node subscribes to a key, notifies all in-process nodes
   * subscribed to that key.
   */
  private _onConnect(e: GitHubElectron.IMainIPCEvent, request: IConnectMessage): void {
    const remoteNode: IRemoteNode = {
      id: request.nodeId,
      key: request.key,
      page: e.sender
    };

    const pages = this._keyToPagesMap.get(remoteNode.key);
    if (pages) {
      let existingPageInfo: IPageInfo;
      for (let pageInfo of pages) {
        if (pageInfo.page === remoteNode.page) {
          existingPageInfo = pageInfo;
          break;
        }
      }
      if (existingPageInfo) {
        ++existingPageInfo.remoteNodeCount;
      } else {
        pages.push({ page: remoteNode.page, remoteNodeCount: 1 });
      }
    } else {
      this._keyToPagesMap.set(remoteNode.key, [{ page: remoteNode.page, remoteNodeCount: 1 }]);
    }

    const nodes = this._keyToNodesMap.get(remoteNode.key);
    if (nodes) {
      for (const node of nodes) {
        node.connect(remoteNode.key, remoteNode);
      }
    }
  }

  /**
   * Called when an out-of-process node unsubscribes from a key, notifies all in-process nodes
   * subscribed to that key.
   */
  private _onDisconnect(e: GitHubElectron.IMainIPCEvent, msg: IDisconnectMessage): void {
    const pages = this._keyToPagesMap.get(msg.key);
    for (let i = 0; i < pages.length; ++i) {
      if (pages[i].page === e.sender) {
        const { page, remoteNodeCount } = pages[i];
        if (remoteNodeCount > 1) {
          --pages[i].remoteNodeCount;
        } else if (pages.length > 1) {
          pages.splice(i, 1);
        } else {
          this._keyToPagesMap.delete(msg.key);
        }
        break;
      }
    }

    const nodes = this._keyToNodesMap.get(msg.key);
    if (nodes) {
      for (const node of nodes) {
        node.disconnect(msg.key, msg.nodeId);
      }
    }
  }

  /** Process a message from a renderer-side dispatcher. */
  private _onMessage(e: GitHubElectron.IMainIPCEvent, msg: Message): void {
    switch (msg.kind) {
      case MessageKind.Simple: {
        // forward the message to any page that has any nodes subscribed to the relevant key,
        // except the page from which the message originated (it is assumed the dispatcher in the
        // originating process will send the message to the relevant nodes in that process)
        const pages = this._keyToPagesMap.get(msg.key);
        for (let pageInfo of pages) {
          if (pageInfo.page !== e.sender) {
            pageInfo.page.send(ipcChannels.MESSAGE, msg);
          }
        }
        break;
      }

      case MessageKind.Request:
        this._forwardRequest(msg, e.sender);
        break;

      case MessageKind.Response:
        for (let i = 0; i < this._pendingRequests.length; ++i) {
          const request = this._pendingRequests[i];
          if (request.id === msg.requestId) {
            this._pendingRequests.splice(i, 1);
            request.onResponse(msg.payload);
            break;
          }
        }
        break;

      case MessageKind.Error:
        for (let i = 0; i < this._pendingRequests.length; ++i) {
          const request = this._pendingRequests[i];
          if (request.id === msg.requestId) {
            this._pendingRequests.splice(i, 1);
            request.onError({ name: msg.name, message: msg.message, stack: msg.stack });
            break;
          }
        }
        break;
    }
  }

  /**
   * Forward a request from one page to another, then forward the response back to the page that
   * sent the request.
   *
   * @param request The request to be forwarded.
   * @param sender The page from which the request was sent.
   * @return A promise that will be resolved after a response for the request is sent back to
   *         the sender.
   */
  private _forwardRequest(
    request: IRequest, sender: GitHubElectron.WebContents
  ): Promise<void> {
    return this.sendRequest(request.key, request.channel, request.payload, sender)
    .then(response => {
      const msg: IResponse = {
        kind: MessageKind.Response,
        requestId: request.id,
        payload: response
      };
      sender.send(ipcChannels.MESSAGE, msg);
    })
    .catch(error => {
      const msg: IErrorResponse = {
        kind: MessageKind.Error,
        key: request.key,
        channel: request.channel,
        requestId: request.id,
        name: error.name,
        message: error.message,
        stack: error.stack
      };
      sender.send(ipcChannels.MESSAGE, msg);
    });
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
