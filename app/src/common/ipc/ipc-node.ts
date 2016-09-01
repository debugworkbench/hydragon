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

export interface IMessage {
  kind: MessageKind;
  payload?: any;
}

export interface ISimpleMessage extends IMessage {
  key: string;
  channel: string;
  /** Identifier of the remote node the message is destined for. */
  nodeId?: number;
}

export interface IRequest extends ISimpleMessage {
  id: number;
}

export interface IResponse extends IMessage {
  requestId: number;
}

export interface IErrorResponse extends IResponse, ISimpleMessage {
  name: string;
  message: string;
  stack?: string;
}

export function isSimpleMessage(msg: IMessage): msg is ISimpleMessage {
  return msg.kind === MessageKind.Simple;
}

export function isRequest(msg: IMessage): msg is IRequest {
  return msg.kind === MessageKind.Request;
}

export function isResponse(msg: IMessage): msg is IResponse {
  return msg.kind === MessageKind.Response;
}

export function isErrorResponse(msg: IMessage): msg is IErrorResponse {
  return msg.kind === MessageKind.Error;
}