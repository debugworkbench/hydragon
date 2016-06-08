// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const IPC_CONNECT = 'source-dir-registry:connect';
export const IPC_DISCONNECT = 'source-dir-registry:disconnect';
export const IPC_UPDATE = 'source-dir-registry:update';

export interface IConnectResponse {
  dirPaths: string[];
}

export interface IUpdateRequest {
  kind: 'add';
  dirPaths: string[];
}
