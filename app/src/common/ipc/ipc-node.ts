// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const IPC_CONNECT = 'ipc-node:connect';
export const IPC_DISCONNECT = 'ipc-node:disconnect';
export const IPC_MESSAGE = 'ipc-node:msg';

export interface IConnectMessage {
  /** Identifier of the remote node that has come online. */
  nodeId: number;
  /** The keys and channels the remote node will use to communicate. */
  keys: { [key: string]: Array</*channel:*/string> };
}

export interface IDisconnectMessage {
  /** Identifier of the remote node that has gone offline. */
  nodeId: number;
  /** The keys and channels the remote node used to communicate. */
  keys: { [key: string]: Array</*channel:*/string> };
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
