// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const ipcChannels = {
  CONNECT: 'ipc-node:connect',
  DISCONNECT: 'ipc-node:disconnect',
  MESSAGE: 'ipc-node:msg',
};

/**
 * Sent by [[RendererIPCDispatcher]] to [[MainIPCDispatcher]] when a node in the renderer process
 * subscribes to a key.
 */
export interface IConnectMessage {
  /** Identifier of the remote node that has come online. */
  nodeId: number;
  /** The key the remote node will use to communicate. */
  key: string;
}

/**
 * Sent by [[RendererIPCDispatcher]] to [[MainIPCDispatcher]] when a node in the renderer process
 * unsubscribes from a key.
 */
export interface IDisconnectMessage {
  /** Identifier of the remote node that has gone offline. */
  nodeId: number;
  /** The key the remote node used to communicate. */
  key: string;
}

export enum MessageKind {
  Simple,
  Request,
  Response,
  Error
}

export interface ISimpleMessage {
  kind: MessageKind.Simple;
  key: string;
  channel: string;
  payload?: any;
  /** Identifier of the remote node the message is destined for. */
  nodeId?: number;
}

export interface IRequest {
  kind: MessageKind.Request;
  key: string;
  channel: string;
  id: number;
  payload?: any;
}

export interface IResponse {
  kind: MessageKind.Response;
  requestId: number;
  payload?: any;
}

export interface IErrorResponse {
  kind: MessageKind.Error;
  key: string;
  channel: string;
  requestId: number;
  name: string;
  message: string;
  stack?: string;
}

export type Message = ISimpleMessage | IRequest | IResponse | IErrorResponse;
