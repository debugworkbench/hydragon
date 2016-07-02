// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer, remote } from 'electron';
import * as path from 'path';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { RendererIPCDispatcher, IRendererDispatcherNode } from 'app/renderer/ipc-dispatcher';
import { ipcChannels as dispatcherIpcChannels } from 'app/common/ipc/ipc-node';
import {
  DISPATCHER_IPC_KEY, dispatcherChannels, ipcChannels, ITestPayload
} from '../../common/ipc-dispatcher';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RendererIPCDispatcher', function () {
  it('cleans up IPC listeners when disposed', () => {
    const dispatcher = new RendererIPCDispatcher();
    expect(ipcRenderer.listeners(dispatcherIpcChannels.MESSAGE)).to.have.lengthOf(1);
    dispatcher.dispose();
    expect(ipcRenderer.listeners(dispatcherIpcChannels.MESSAGE)).to.have.lengthOf(0);
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
        ipcRenderer.send(ipcChannels.TEST_BROADCAST_MSG);
      }).then(() => node.dispose());
    });

    it('receives a message @awaitMessage', () => {
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
      }).then(() => node.dispose());
    });

    it('receives a request and sends a response @awaitRequest', () => {
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
        ipcRenderer.send(ipcChannels.TEST_SEND_REQUEST);
      }).then(() => node.dispose());
    });
  });
});
