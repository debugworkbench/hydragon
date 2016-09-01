// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer, remote } from 'electron';
import * as path from 'path';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { RendererIPCDispatcher, IRendererDispatcherNode } from 'app/renderer/ipc-dispatcher';
import { ipcChannels as dispatcherIpcChannels } from 'app/common/ipc/ipc-node';
import {
  DISPATCHER_IPC_KEY, dispatcherChannels, ipcChannels as ipcTestChannels, ITestPayload
} from '../../common/ipc-dispatcher';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RendererIPCDispatcher', function () {
  const requestPayload: ITestPayload = { title: 'This is a request' };
  const responsePayload: ITestPayload = { title: 'This is a response' };

  describe('#dispose()', () => {
    it('cleans up IPC listeners @unit', () => {
      const dispatcher = new RendererIPCDispatcher();
      expect(ipcRenderer.listeners(dispatcherIpcChannels.MESSAGE)).to.have.lengthOf(1);
      dispatcher.dispose();
      expect(ipcRenderer.listeners(dispatcherIpcChannels.MESSAGE)).to.have.lengthOf(0);
    });
  });

  describe('#sendRequest()', () => {
    let dispatcher: RendererIPCDispatcher;

    beforeEach(() => {
      dispatcher = new RendererIPCDispatcher();
    });

    afterEach(() => {
      dispatcher.dispose();
    });

    it('returns a response from another renderer process @awaitSendRequest', () => {
      let node: IRendererDispatcherNode;
      return new Promise<ITestPayload>((resolve, reject) => {
        node = dispatcher.createNode();
        // wait for the main process to start the second renderer process
        node.onMessage(DISPATCHER_IPC_KEY, 'sendRequest', () => {
          resolve(dispatcher.sendRequest<ITestPayload, ITestPayload>(
            DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST, requestPayload
          ));
        });
      })
      .then(response => {
        expect(response.title).to.equal(responsePayload.title);
        node.dispose();
      });
    });

    it('returns a response from the same renderer process @unit', async () => {
      const node = dispatcher.createNode();
      node.onRequest<ITestPayload, ITestPayload>(DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST,
        request => {
          try {
            expect(request.title).to.equal(requestPayload.title);
          } catch (err) {
            return Promise.reject(err);
          }
          return Promise.resolve(responsePayload);
        }
      );
      const response = await dispatcher.sendRequest<ITestPayload, ITestPayload>(
        DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST, requestPayload
      );
      expect(response.title).to.equal(responsePayload.title);
      node.dispose();
    });
  });

  describe('Node', () => {
    let dispatcher: RendererIPCDispatcher;

    beforeEach(() => {
      dispatcher = new RendererIPCDispatcher();
    });

    afterEach(() => {
      dispatcher.dispose();
    });

    describe('#onMessage()', () => {
      it('invokes callback for a message broadcast from the main process @awaitBroadcast', () => {
        let node: IRendererDispatcherNode;
        return new Promise<void>((resolve, reject) => {
          node = dispatcher.createNode();
          node.onMessage<ITestPayload>(DISPATCHER_IPC_KEY, dispatcherChannels.BROADCAST, msg => {
            try {
              expect(msg.title).to.equal('This is a broadcast');
              resolve();
            } catch (err) {
              reject(err);
            }
          });
          // get the main process to broadcast the test message
          ipcRenderer.send(ipcTestChannels.TEST_BROADCAST_MSG);
        })
        .then(() => node.dispose());
      });

      it('invokes callback for a message sent from the main process @awaitMessage', () => {
        let node: IRendererDispatcherNode;
        return new Promise<void>((resolve, reject) => {
          node = dispatcher.createNode();
          node.onMessage<ITestPayload>(DISPATCHER_IPC_KEY, dispatcherChannels.MESSAGE, msg => {
            try {
              expect(msg.title).to.equal('This is a message');
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        })
        .then(() => node.dispose());
      });
    });

    describe('#onRequest()', () => {
      it('invokes callback for a request sent from the main process @awaitRequest', () => {
        let node: IRendererDispatcherNode;
        return new Promise<void>((resolve, reject) => {
          node = dispatcher.createNode();
          node.onRequest<ITestPayload, ITestPayload>(DISPATCHER_IPC_KEY, dispatcherChannels.REQUEST,
            msg => {
              try {
                expect(msg.title).to.equal('This is a request');
                resolve();
                return Promise.resolve({ title: 'This is a response'});
              } catch (err) {
                reject(err);
              }
            }
          );
          // get the main process to send the test request
          ipcRenderer.send(ipcTestChannels.TEST_SEND_REQUEST);
        })
        .then(() => node.dispose());
      });
    });
  });
});
