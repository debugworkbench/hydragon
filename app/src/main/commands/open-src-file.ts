// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ICommand, ICommandArgs } from '../../common/command-table';
import { Project } from '../project';

/**
 * Opens a source file and displays it on a page.
 */
export class OpenSourceFileCommand implements ICommand {
  private _project: Project;

  constructor({ project }: OpenSourceFileCommand.IConstructorParams) {
    this._project = project;
  }

  /**
   * @return A promise that will be resolved when the command is done.
   */
  execute({ filePath, browserWindow }: OpenSourceFileCommand.IArgs): Promise<void> {
    return this._project.openSourceFile(filePath/*, { line, column }*/);
  }
}

export namespace OpenSourceFileCommand {
  export interface IConstructorParams {
    project: Project;
  }

  export interface IArgs extends ICommandArgs {
    /** Absolute path to a source file. */
    filePath?: string;
  }
}
