// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as DebugEngineProvider from 'debug-engine';
import { IDebugConfig } from 'debug-engine';
import { DialogModel } from './dialog';

export class NewDebugConfigDialogModel extends DialogModel {
  debugConfig: IDebugConfig;

  onDidConfirm(data: NewDebugConfigDialogModel.IData): void {
    this.debugConfig = null;
    const debugEngine = DebugEngineProvider.getEngine(data.debugEngineId);
    if (debugEngine) {
      this.debugConfig = debugEngine.createConfig(data.debugConfigName);
    }
    this.close();
  }

  onDidCancel(): void {
    this.close();
  }
}

namespace NewDebugConfigDialogModel {
  export interface IData {
    debugEngineId: string;
    debugConfigName: string;
  }
}
