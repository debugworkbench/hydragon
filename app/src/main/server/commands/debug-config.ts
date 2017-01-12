// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import {
  ICommand, ICommand1, DynamicArrayRecord, DynamicValueRecord
} from '../../../display-server';
import { DebugConfigManager, IDebugConfig } from '../debug-config-manager';
import { Project } from '../project';

export class ListDebugConfigsCommand implements ICommand<DynamicArrayRecord<IDebugConfig>> {
  constructor(private _debugConfigManager: DebugConfigManager) {}

  async execute(): Promise<DynamicArrayRecord<IDebugConfig>> {
    return DynamicArrayRecord.fromProperty<IDebugConfig>(
      'DebugConfig', this._debugConfigManager, 'debugConfigs'
    );
  }
}

export class SelectDebugConfigCommand implements ICommand1<void, IDebugConfig> {
  constructor(private _project: Project) {}

  async execute(debugConfig: IDebugConfig): Promise<void> {
    this._project.currentDebugConfig = debugConfig;
  }
}

export class GetCurrentDebugConfigCommand implements ICommand<DynamicValueRecord<IDebugConfig>> {
  constructor(private _project: Project) {}

  async execute(): Promise<DynamicValueRecord<IDebugConfig>> {
    return DynamicValueRecord.fromProperty('DebugConfig', this._project, 'currentDebugConfig');
  }
}

export class EditDebugConfigCommand implements ICommand1<void, IDebugConfig> {
  async execute(debugConfig: IDebugConfig): Promise<void> {
    // TODO
  }
}
