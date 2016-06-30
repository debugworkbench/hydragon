// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer, remote } from 'electron';
import * as path from 'path';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { RendererIPCDispatcher } from 'app/renderer/ipc-dispatcher';
import { IPC_MESSAGE } from 'app/common/ipc/ipc-node';
import {
  DISPATCHER_IPC_KEY, dispatcherChannels, ipcChannels, ITestPayload
} from '../../common/ipc-dispatcher';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RendererIPCDispatcher', function () {
  it('cleans up IPC listeners when disposed', () => {
    const dispatcher = new RendererIPCDispatcher();
    expect(ipcRenderer.listeners(IPC_MESSAGE)).to.have.lengthOf(1);
    dispatcher.dispose();
    expect(ipcRenderer.listeners(IPC_MESSAGE)).to.have.lengthOf(0);
  });

  describe('Messages', () => {
    let dispatcher: RendererIPCDispatcher;

    beforeEach(() => {
      dispatcher = new RendererIPCDispatcher();
    });

    afterEach(() => {
      dispatcher.dispose();
    });

    it('receives a broadcast message @awaitBroadcast', () => {
      let unregisterNode: RendererIPCDispatcher.UnregisterNodeCallback;
      return new Promise<void>((resolve, reject) => {
        unregisterNode = dispatcher.registerNode({
          keys: {
            [DISPATCHER_IPC_KEY]: {
              [dispatcherChannels.BROADCAST]: (msg: ITestPayload): void => {
                try {
                  expect(msg.title).to.equal('This is a broadcast');
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }
            }
          }
        });
        ipcRenderer.send(ipcChannels.TEST_BROADCAST_MSG);
      }).then(unregisterNode);
    });

    it('receives a message @awaitMessage', () => {
      let unregisterNode: RendererIPCDispatcher.UnregisterNodeCallback;
      return new Promise<void>((resolve, reject) => {
        unregisterNode = dispatcher.registerNode({
          keys: {
            [DISPATCHER_IPC_KEY]: {
              [dispatcherChannels.MESSAGE]: (msg: ITestPayload): void => {
                try {
                  expect(msg.title).to.equal('This is a message');
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }
            }
          }
        });
      }).then(unregisterNode);
    });

    it('receives a request and sends a response @awaitRequest', () => {
      let unregisterNode: RendererIPCDispatcher.UnregisterNodeCallback;
      return new Promise<void>((resolve, reject) => {
        unregisterNode = dispatcher.registerNode({
          keys: {
            [DISPATCHER_IPC_KEY]: {
              [dispatcherChannels.REQUEST]: (msg: ITestPayload): Promise<ITestPayload> => {
                try {
                  expect(msg.title).to.equal('This is a request');
                  resolve();
                  return Promise.resolve({ title: 'This is a response'});
                } catch (err) {
                  reject(err);
                }
              }
            }
          }
        });
        ipcRenderer.send(ipcChannels.TEST_SEND_REQUEST);
      }).then(unregisterNode);
    });
  });
});
