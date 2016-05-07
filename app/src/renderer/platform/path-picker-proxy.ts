// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import { PathPickerIpc } from '../../common/path-picker-ipc';

/**
 * Displays native dialogs that allow the user to browse the file system and select one or more
 * files or directories. Only one instance of this class should exist at any one time.
 *
 * Instances of this class can only live in the renderer process, where they proxy file prompt
 * requests to a [[PathPicker]] instance in the main process.
 */
export class PathPickerProxy {
  private requestId = 0;
  private pendingRequests = new Map</*requestId:*/number, (filePaths: string[]) => void>();

  constructor() {
    ipcRenderer.on(PathPickerIpc.IPC_PICK_PATH_RESPONSE, this.handleResponse);
  }

  dispose(): void {
    ipcRenderer.removeListener(PathPickerIpc.IPC_PICK_PATH_RESPONSE, this.handleResponse);
  }

  private handleResponse = (
    event: GitHubElectron.IRendererIPCEvent, response: PathPickerIpc.IDidPickPathResponse
  ): void => {
    this.pendingRequests.get(response.requestId)(response.filePaths);
  }

  promptForPath(options: PathPickerProxy.IPathPromptOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const request: PathPickerIpc.IPickPathRequest = {
        id: this.requestId++,
        options
      };
      this.pendingRequests.set(request.id, (filePaths: string[]) => {
        this.pendingRequests.delete(request.id);
        (filePaths.length > 0) ? resolve(filePaths[0]) : resolve(null);
      })
      ipcRenderer.send(PathPickerIpc.IPC_PICK_PATH_REQUEST, request);
    });
  }
}

export namespace PathPickerProxy {
  export type PathKind = PathPickerIpc.PathKind;
  export type IPathPromptOptions = PathPickerIpc.IPathPromptOptions;
}
