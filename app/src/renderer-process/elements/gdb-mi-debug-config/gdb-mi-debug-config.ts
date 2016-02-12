// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { IDebugConfig } from 'debug-engine';
import { IGdbMiDebugConfig, DebuggerType } from 'gdb-mi-debug-engine';
import DebugConfigManager from '../../debug-config-manager';
import { Disposable, Emitter } from 'event-kit';

interface ILocalDOM {
  dialog: PolymerElements.PaperDialog;
  debuggerTypes: PolymerElements.PaperMenu;
}

const OPENED_EVENT = 'opened';
const CLOSED_EVENT = 'closed';

export type IGdbMiDebugConfigElement = GdbMiDebugConfigElement;

/**
 * An element that lets the user edit a debug configuration for the gdb-mi debug engine.
 */
@pd.is('hydragon-gdb-mi-debug-config')
export default class GdbMiDebugConfigElement extends Polymer.BaseClass<ILocalDOM>() {
  private emitter: Emitter;
  private _debugConfigManager: DebugConfigManager;

  @pd.property({ type: Object })
  private debugConfig: IGdbMiDebugConfig;

  created(): void {
    this.emitter = new Emitter();
  }

  destroy(): void {
    if (this.emitter) {
      this.emitter.dispose();
      this.emitter = null;
    }
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(debugConfigManager: DebugConfigManager, debugConfig: IDebugConfig): void {
    this._debugConfigManager = debugConfigManager;
    this.debugConfig = <IGdbMiDebugConfig> debugConfigManager.modify(debugConfig);
    this.$.debuggerTypes.select(this.debugConfig.debuggerType);
  }

  @pd.listener('dialog.iron-overlay-opened')
  private onIronOverlayOpened(e: CustomEvent): void {
    if (Polymer.dom(e).localTarget === this.$.dialog) {
      this.emitter.emit(OPENED_EVENT);
    } else {
      e.stopPropagation();
    }
  }

  @pd.listener('dialog.iron-overlay-closed')
  private onIronOverlayClosed(e: PolymerElements.IronOverlayClosedEvent): void {
    if (Polymer.dom(e).localTarget === this.$.dialog) {
      if (e.detail.confirmed) {
        this.debugConfig.debuggerType = Number(this.$.debuggerTypes.selected);
        this._debugConfigManager.save(this.debugConfig);
      } else {
        this._debugConfigManager.discardChanges(this.debugConfig);
      }
      this.emitter.emit(CLOSED_EVENT, e.detail);
    } else {
      e.stopPropagation();
    }
  }

  /** Add a function to be called when the dialog is opened. */
  onOpened(callback: () => void): Disposable {
    return this.emitter.on(OPENED_EVENT, callback);
  }

  /** Add a function to be called when the dialog is closed. */
  onClosed(callback: (closingReason: PolymerElements.IClosingReason) => void): Disposable {
    return this.emitter.on(CLOSED_EVENT, callback);
  }

  open(): void {
    this.$.dialog.open();
  }

  close(): void {
    this.$.dialog.close();
  }
}
