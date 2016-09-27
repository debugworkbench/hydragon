// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const IPC_SYNC = 'sync';
export const IPC_UPDATE = 'update';

export interface ISyncMessage {
  dirPaths: string[];
}

export interface IUpdateMessage {
  kind: 'add';
  dirPaths: string[];
}
