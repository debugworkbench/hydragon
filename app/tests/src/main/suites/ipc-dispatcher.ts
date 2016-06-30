// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import * as path from 'path';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MainIPCDispatcher } from 'app/main/ipc-dispatcher';
import { IPC_CONNECT, IPC_DISCONNECT, IPC_MESSAGE } from 'app/common/ipc/ipc-node';
import {
  DISPATCHER_IPC_KEY, dispatcherChannels, ipcChannels, ITestPayload
} from '../../common/ipc-dispatcher';
import { channels as mochaChannels, ITestRunOptions } from '../../common/mocha-ipc';
import { runRendererTests } from '../utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const RENDERER_TESTS_FILE = path.resolve(__dirname, '../../renderer/suites/ipc-dispatcher.js');

describe('MainIPCDispatcher', function () {
  this.timeout(0);

  it('cleans up IPC listeners when disposed', () => {
    const dispatcher = new MainIPCDispatcher();
    dispatcher.dispose();
    [IPC_CONNECT, IPC_DISCONNECT, IPC_MESSAGE].forEach(event => {
      expect(ipcMain.listeners(event)).to.have.lengthOf(0);
    });
  });

  describe('Messages', () => {
    let dispatcher: MainIPCDispatcher;

    beforeEach(() => {
      dispatcher = new MainIPCDispatcher();
    });

    afterEach(() => {
      dispatcher.dispose();
    });

    it('broadcasts a message', () => {
      const broadcastWhenRendererReady = new Promise<void>((resolve, reject) => {
        ipcMain.once(ipcChannels.TEST_BROADCAST_MSG, () => {
          try {
            dispatcher.broadcastMessage<ITestPayload>(
              DISPATCHER_IPC_KEY, dispatcherChannels.BROADCAST, { title: 'This is a broadcast' }
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
      return runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitBroadcast/ })
      .then(() => broadcastWhenRendererReady);
    });

    it('sends a message', () => {
      let disposeNode: MainIPCDispatcher.UnregisterNodeCallback;
      const sendMsgWhenRendererReady = new Promise<void>((resolve, reject) => {
        disposeNode = dispatcher.registerNode({
          keys: { [DISPATCHER_IPC_KEY]: Object.create(null) },
          onConnect: (key, node) => {
            try {
              dispatcher.sendMessage<ITestPayload>(
                node, DISPATCHER_IPC_KEY, dispatcherChannels.MESSAGE, { title: 'This is a message' }
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          }
        });
      });
      return runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitMessage/ })
      .then(() => sendMsgWhenRendererReady)
      .then(() => disposeNode());
    });

    it('sends a request and receives a response', () => {
      const sendRequestWhenRendererReady = new Promise<void>((resolve, reject) => {
        ipcMain.once(ipcChannels.TEST_SEND_REQUEST, () => {
          dispatcher.sendRequest<ITestPayload, ITestPayload>(
            DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST, { title: 'This is a request' }
          ).then(response => {
            expect(response.title).to.equal('This is a response');
          }).then(resolve, reject);
        });
      });
      return runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitRequest/ })
      .then(() => sendRequestWhenRendererReady);
    });
  });
});
