// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { PageModel } from './page';
import { FileInputModel } from '../file-input';
import { PathPickerProxy } from '../../../platform/path-picker-proxy';

export class GdbMiDebugConfigPageModel extends PageModel {
  executable: FileInputModel;
  debuggerPath: FileInputModel;
  executableArgs: string;
  targetIsRemote: boolean;
  host: string;
  port: string;

  constructor({ id, pathPicker }: GdbMiDebugConfigPageModel.IConstructorParams) {
    super({ id });
    this.executable = new FileInputModel({ pathKind: 'file', pathPicker });
    this.debuggerPath = new FileInputModel({ pathKind: 'file', pathPicker });
  }
}

export namespace GdbMiDebugConfigPageModel {
  export interface IConstructorParams extends PageModel.IConstructorParams {
    pathPicker: PathPickerProxy;
  }
}