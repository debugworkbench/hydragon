// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ICommand, ICommandArgs } from '../../common/command-table';
import { PathPicker } from '../platform/path-picker';
import { Project } from '../project';

/**
 * Opens a source directory and displays it in the `Explorer` panel.
 *
 * If a directory path is not supplied the user will be prompted for one.
 */
export class OpenSourceDirCommand implements ICommand {
  private _pathPicker: PathPicker;
  private _project: Project;

  constructor(params: OpenSourceDirCommand.IConstructorParams) {
    this._pathPicker = params.pathPicker;
    this._project = params.project;
  }

  /**
   * If the directory path is not supplied a native directory selection dialog will be displayed.
   *
   * @return A promise that will be resolved when the command is done.
   */
  async execute({ dirPath, browserWindow }: OpenSourceDirCommand.IArgs): Promise<void> {
    if (!dirPath) {
      dirPath = await this._pathPicker.promptForPath({
        title: 'Open Source Directory', pathKind: 'dir', parentWindow: browserWindow
      });
      if (dirPath === null) {
        return;
      }
    }
    this._project.addSourceDirs(dirPath);
  }
}

export namespace OpenSourceDirCommand {
  export interface IConstructorParams {
    pathPicker: PathPicker;
    project: Project;
  }

  export interface IArgs extends ICommandArgs {
    /** Absolute path to a source directory. */
    dirPath?: string;
  }
}
