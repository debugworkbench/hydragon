// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, dialog, BrowserWindow } from 'electron';
import { PathPickerIpc } from '../../common/path-picker-ipc';

/**
 * Displays native dialogs that allow the user to browse the file system and select one or more
 * files or directories. Only one instance of this class should exist at any one time.
 *
 * Instances of this class can only live in the main/browser process since the Electron `dialog`
 * module that is used to display the native file prompts is only available in that process.
 * In the renderer process you should use the [[PathPickerProxy]] class instead.
 */
export class PathPicker {
  constructor() {
    ipcMain.on(PathPickerIpc.IPC_PICK_PATH_REQUEST, this.handleRequest);
  }

  dispose(): void {
    ipcMain.removeListener(PathPickerIpc.IPC_PICK_PATH_REQUEST, this.handleRequest);
  }

  private handleRequest = (
    event: GitHubElectron.IMainIPCEvent, request: PathPickerIpc.IPickPathRequest
  ) => {
    const parentWindow =
      (request.options.isOwned === true) ? BrowserWindow.fromWebContents(event.sender) : null;

    this.promptForPath(Object.assign({}, request.options, { parentWindow }))
    .then(path => {
      const response: PathPickerIpc.IDidPickPathResponse = {
        requestId: request.id,
        filePaths: path ? [path] : []
      };
      event.sender.send(PathPickerIpc.IPC_PICK_PATH_RESPONSE, response);
    });
  };

  /**
   * @return A promise that will be resolved with the file/dir path selected by the user,
   *         or `null` if the user dismissed the file prompt without making a selection.
   */
  promptForPath({
    parentWindow, title = 'Open File', defaultPath, pathKind = 'file'
  }: PathPicker.IPathPromptOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const properties: GitHubElectron.Dialog.OpenDialogProperty[] = [];
      if (pathKind === 'file') {
        properties.push('openFile');
      } else if (pathKind === 'dir') {
        properties.push('openDirectory');
      } else {
        properties.push('openFile', 'openDirectory');
      }
      const options: GitHubElectron.Dialog.OpenDialogOptions = {
        title,
        defaultPath,
        properties
      };
      // Apparently on OS X the open dialog shouldn't have a parent window
      if (process.platform !== 'darwin') {
        parentWindow = null;
      }
      dialog.showOpenDialog(parentWindow, options, (fileNames: string[]) =>
        (fileNames && (fileNames.length > 0)) ? resolve(fileNames[0]) : resolve(null)
      );
    });
  }
}

export namespace PathPicker {
  export interface IPathPromptOptions extends PathPickerIpc.IPathPromptOptions {
    /**
     * The window (if any) to set as the owner of the file prompt.
     * If the file prompt shouldn't have an owner then this must be set to `null`.
     */
    parentWindow: GitHubElectron.BrowserWindow;
  }
}
