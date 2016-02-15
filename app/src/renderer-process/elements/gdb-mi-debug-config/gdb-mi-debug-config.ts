// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { IDebugConfig } from 'debug-engine';
import { IGdbMiDebugConfig, DebuggerType } from 'gdb-mi-debug-engine';
import DebugConfigManager from '../../debug-config-manager';

interface ILocalDOM {
  debuggerTypes: PolymerElements.PaperMenu;
}

export type IGdbMiDebugConfigElement = GdbMiDebugConfigElement;

/**
 * An element that lets the user edit a debug configuration for the gdb-mi debug engine.
 */
@pd.is('hydragon-gdb-mi-debug-config')
export default class GdbMiDebugConfigElement extends Polymer.BaseClass<ILocalDOM>() {
  private _debugConfigManager: DebugConfigManager;

  @pd.property({ type: Object })
  private debugConfig: IGdbMiDebugConfig;

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(debugConfigManager: DebugConfigManager, debugConfig: IDebugConfig): void {
    this._debugConfigManager = debugConfigManager;
    this.debugConfig = <IGdbMiDebugConfig> debugConfigManager.modify(debugConfig);
    this.$.debuggerTypes.select(this.debugConfig.debuggerType);
  }

  @pd.listener('saveButton.tap')
  private _onDidTapSaveButton(e: polymer.TapEvent): void {
    this.debugConfig.debuggerType = Number(this.$.debuggerTypes.selected);
    this._debugConfigManager.save(this.debugConfig);
  }
}
