// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import * as path from 'path';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MainIPCDispatcher, IMainDispatcherNode, IRemoteNode } from 'app/main/ipc-dispatcher';
import { ipcChannels as dispatcherIpcChannels } from 'app/common/ipc/ipc-node';
import {
  DISPATCHER_IPC_KEY, dispatcherChannels, ipcChannels as ipcTestChannels, ITestPayload
} from '../../common/ipc-dispatcher';
import { channels as mochaChannels, ITestRunOptions } from '../../common/mocha-ipc';
import { TestEnvironment } from '../test-environment';

chai.use(chaiAsPromised);
const expect = chai.expect;

const RENDERER_TESTS_FILE = path.resolve(__dirname, '../../renderer/suites/ipc-dispatcher.js');

describe('MainIPCDispatcher', function () {
  const testEnv = TestEnvironment.instance;
  // probably just temporary, prevents tests from timing out while poking around with the debugger
  this.timeout(0);

  describe('#dispose()', () => {
    it('cleans up IPC listeners @unit', () => {
      const dispatcher = new MainIPCDispatcher();
      dispatcher.dispose();
      [
        dispatcherIpcChannels.CONNECT,
        dispatcherIpcChannels.DISCONNECT,
        dispatcherIpcChannels.MESSAGE
      ].forEach(event => {
        expect(ipcMain.listeners(event)).to.have.lengthOf(0);
      });
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
        // wait for the go-ahead from the renderer process before broadcasting the test message
        ipcMain.once(ipcTestChannels.TEST_BROADCAST_MSG, () => {
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
      // TODO: Spawning two renderer processes would make for a better test.
      return testEnv.runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitBroadcast/ })
      .then(() => broadcastWhenRendererReady);
    });

    it('sends a message', () => {
      let node: IMainDispatcherNode;
      const sendMsgWhenRendererReady = new Promise<void>((resolve, reject) => {
        node = dispatcher.createNode();
        node.onConnect(DISPATCHER_IPC_KEY, (key, remoteNode) => {
          try {
            dispatcher.sendMessage<ITestPayload>(
              remoteNode, DISPATCHER_IPC_KEY, dispatcherChannels.MESSAGE,
              { title: 'This is a message' }
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
      return testEnv.runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitMessage/ })
      .then(() => sendMsgWhenRendererReady)
      .then(() => node.dispose());
    });

    it('sends a request and receives a response', () => {
      const sendRequestWhenRendererReady = new Promise<void>((resolve, reject) => {
        // wait for the go-ahead from the renderer process before sending the test request
        ipcMain.once(ipcTestChannels.TEST_SEND_REQUEST, () => {
          dispatcher.sendRequest<ITestPayload, ITestPayload>(
            DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST, { title: 'This is a request' }
          ).then(response => {
            expect(response.title).to.equal('This is a response');
          }).then(resolve, reject);
        });
      });
      return testEnv.runRendererTests({ file: RENDERER_TESTS_FILE, grep: /@awaitRequest/ })
      .then(() => sendRequestWhenRendererReady);
    });

    it('forwards a request from one page to another', () => {
      let node: IMainDispatcherNode;
      // the remote node that will send the message that needs to be forwarded
      let senderNode: IRemoteNode;
      // this promise will be resolved when both pages are ready to go
      const waitForPagesToLoad = new Promise<void>((resolve, reject) => {
        let remoteNodeCount = 0;
        node = dispatcher.createNode();
        node.onConnect(DISPATCHER_IPC_KEY, (key, remoteNode) => {
          ++remoteNodeCount;
          if (remoteNode.page === testEnv.getPageById('1st')) {
            senderNode = remoteNode;
          }
          if (remoteNodeCount === 2) {
            resolve();
          }
        });
      });
      // this promise will be resolved when all renderer tests have finished running
      const waitForTestsToEnd = Promise.all([
        testEnv.runRendererTests({
          page: '1st', file: RENDERER_TESTS_FILE, grep: /@awaitSendRequest/
        }),
        testEnv.runRendererTests({
          page: '2nd', file: RENDERER_TESTS_FILE, grep: /@awaitRequest/
        })
      ]);

      return waitForPagesToLoad
      .then(() => {
        dispatcher.sendMessage(senderNode, DISPATCHER_IPC_KEY, 'sendRequest', null);
        return waitForTestsToEnd;
      })
      .then(() => node.dispose());
    });
  });
});
