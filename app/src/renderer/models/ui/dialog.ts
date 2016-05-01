// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subscription } from '@reactivex/rxjs';
import { EventEmitter } from 'events';
import { observable } from 'mobx';

const DID_CLOSE_EVENT = 'did-close';

export class DialogModel {
  private emitter = new EventEmitter();

  @observable
  isOpen: boolean = false;

  /** Add an event listener to be invoked when the dialog is closed. */
  onDidClose(listener: () => void): Subscription {
    this.emitter.on(DID_CLOSE_EVENT, listener);
    return new Subscription(() => this.emitter.removeListener(DID_CLOSE_EVENT, listener));
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.emitter.emit(DID_CLOSE_EVENT);
  }
}