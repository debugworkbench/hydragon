// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/**
 * Encapsulates IPC channel names and request/response interfaces used by
 * [[PathPickerProxy]] (renderer process) and [[PathPicker]] (main process) to communicate with
 * each other.
 */
export class PathPickerIpc {
  /** Channel used by [[PathPickerProxy]] to ask [[PathPicker]] to prompt the user for a file. */
  static readonly IPC_PICK_PATH_REQUEST = 'path-picker:pick-path-request';
  /** Channel used by [[PathPicker]] to send the file prompt result to [[PathPickerProxy]]. */
  static readonly IPC_PICK_PATH_RESPONSE = 'path-picker:pick-path-response';
}

export namespace PathPickerIpc {
  export type PathKind = 'file' | 'dir' | 'all';

  export interface IPathPromptOptions {
    /**
     * If `true` the prompt dialog will be owned by the window from which the prompt request
     * originated, otherwise the prompt dialog won't have a parent window.
     */
    isOwned?: boolean;
    /** Title of the file prompt, e.g. 'Open File' */
    title?: string;
    /** Default path that should be displayed in the file prompt. */
    defaultPath?: string;
    /**
     * The kind of paths the file prompt dialog should allow the user to select.
     * - `file` will only allow the user to select files.
     * - `dir` will only allow the user to select directories.
     * - `all` will allow the user to select both files and directories.
     */
    pathKind?: PathKind;
  }

  export interface IPickPathRequest {
    id: number;
    options: IPathPromptOptions;
  }

  export interface IDidPickPathResponse {
    requestId: number;
    filePaths: string[];
  }
}
