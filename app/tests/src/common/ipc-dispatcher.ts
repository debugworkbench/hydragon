// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const DISPATCHER_IPC_KEY = 'ipc-dispatcher';

export const dispatcherChannels = {
  BROADCAST: 'broadcast',
  MESSAGE: 'send',
  REQUEST: 'request',
};

export const ipcChannels = {
  TEST_BROADCAST_MSG: 'test:broadcast-msg',
  TEST_SEND_REQUEST: 'test:send-request',
};

export interface ITestPayload {
  title: string;
}
