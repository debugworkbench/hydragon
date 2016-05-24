// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import { observable, autorun } from 'mobx';
import * as ipc from '../common/dev-tools-ipc';

/** Provides control over Electron DevTools in a renderer process via IPC with the main process. */
export class RendererDevTools {
  /** Observable that indicates whether or not the Electron DevTools window is currently open. */
  @observable
  isWindowOpen: boolean;

  /** `true` iff a connection with the DevTools in the main process has been established. */
  private isConnected: boolean;

  constructor() {
    this.isWindowOpen = false;
    this.isConnected = false;

    ipcRenderer.once(ipc.IPC_CONNECT,
      (event: GitHubElectron.IRendererIPCEvent, response: ipc.IConnectResponse) =>
      this.onDidConnect(response.isWindowOpen)
    );
    ipcRenderer.send(ipc.IPC_CONNECT);
  }

  dispose(): void {
    if (this.isConnected) {
      ipcRenderer.removeListener(ipc.IPC_DID_OPEN, this.onDidOpen);
      ipcRenderer.removeListener(ipc.IPC_DID_CLOSE, this.onDidClose);
    }
  }

  onDidConnect(isWindowOpen: boolean): void {
    ipcRenderer.on(ipc.IPC_DID_OPEN, this.onDidOpen);
    ipcRenderer.on(ipc.IPC_DID_CLOSE, this.onDidClose);

    window.addEventListener('contextmenu', event => {
      event.preventDefault();
      this.inspectElementAt(event);
    });

    this.isConnected = true;
    this.isWindowOpen = isWindowOpen;
  }

  private onDidOpen = () => this.isWindowOpen = true;
  private onDidClose = () => this.isWindowOpen = false;

  /** Open the Electron DevTools window. */
  open(): void {
    ipcRenderer.send(ipc.IPC_OPEN);
  }

  /** Close the Electron DevTools window. */
  close(): void {
    ipcRenderer.send(ipc.IPC_CLOSE);
  }

  /** Inspect an element at the given location on the curent page. */
  inspectElementAt(location: { x: number; y: number }): void {
    ipcRenderer.send(ipc.IPC_INSPECT_ELEMENT, location);
  }

  reloadPage(): void {
    ipcRenderer.send(ipc.IPC_RELOAD_PAGE);
  }
}
