// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { PathPickerProxy } from '../../platform/path-picker-proxy';

/** Stores data and does the heavy lifting for [[FileInputComponent]]. */
export class FileInputModel {
  /** Title for the file prompt dialog that will be displayed to the user. */
  promptTitle: string;
  /** The kind of path the user is allowed to select, only files, only directories, or both. */
  pathKind: PathPickerProxy.PathKind;
  /**
   * Observable value that contains the default path or the path that was entered/selected by
   * the user.
   */
  @observable
  path: string;

  private pathPicker: PathPickerProxy;

  constructor({ promptTitle, defaultPath, pathKind, pathPicker }: FileInputModel.IConstructorParams) {
    this.promptTitle = promptTitle;
    this.pathKind = pathKind;
    this.pathPicker = pathPicker;
    this.path = defaultPath;
  }

  /**
   * Displays a file prompt that allows the user to browse their file system and select a file.
   *
   * @return A promise that will be resolved with the file/dir path selected by the user,
   *         or `null` if the user dismissed the file prompt without making a selection.
   */
  async promptForFile(): Promise<string> {
    this.path = await this.pathPicker.promptForPath({
      title: this.promptTitle,
      defaultPath: this.path,
      pathKind: this.pathKind,
      isOwned: true
    });
    return this.path;
  }
}

namespace FileInputModel {
  export interface IConstructorParams {
    promptTitle?: string;
    defaultPath?: string;
    pathKind?: PathPickerProxy.PathKind;
    pathPicker: PathPickerProxy;
  }
}
