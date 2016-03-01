// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { Disposable, Emitter } from 'event-kit';
import * as DebugEngineProvider from 'debug-engine';
import { IDebugConfig } from 'debug-engine';

interface ILocalDOM {
  dialog: PolymerElements.PaperDialog;
  configName: PolymerElements.PaperInput;
  engines: PolymerElements.PaperDropdownMenu;
}

const OPENED_EVENT = 'opened';
const CLOSED_EVENT = 'closed';

export type INewDebugConfigDialogElement = NewDebugConfigDialogElement;

/**
 * A simple dialog that lets the user enter the name for a new debug config and select
 * the debug engine the new config will be used with.
 */
@pd.is('hydragon-new-debug-config-dialog')
export default class NewDebugConfigDialogElement extends Polymer.BaseClass<ILocalDOM>() {
  private emitter: Emitter;

  created(): void {
    this.emitter = new Emitter();
  }

  destroy(): void {
    if (this.emitter) {
      this.emitter.dispose();
      this.emitter = null;
    }
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
      let debugConfig: IDebugConfig = null;
      const debugEngine = DebugEngineProvider.getEngine(this.$.engines.selectedItemLabel);
      if (e.detail.confirmed && debugEngine) {
        debugConfig = debugEngine.createConfig(this.$.configName.value);
      }
      this.emitter.emit(CLOSED_EVENT, debugConfig);
    } else {
      e.stopPropagation();
    }
  }

  /** Add a function to be called when the dialog is opened. */
  onOpened(callback: () => void): Disposable {
    return this.emitter.on(OPENED_EVENT, callback);
  }

  /** Add a function to be called when the dialog is closed. */
  onClosed(callback: (debugConfig: IDebugConfig) => void): Disposable {
    return this.emitter.on(CLOSED_EVENT, callback);
  }

  open(): void {
    this.$.dialog.open();
  }

  close(): void {
    this.$.dialog.close();
  }
}
