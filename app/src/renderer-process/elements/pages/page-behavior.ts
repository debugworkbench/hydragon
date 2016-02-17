// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { EventSubscription, EventEmitter } from '../../../common/events';

enum EventId {
  DidClose
}

/**
 * Provides base functionality of page elements.
 */
export class PageBehaviorImpl extends Polymer.BaseClass<any, typeof Polymer.IronResizableBehavior>() {
  private _emitter: EventEmitter<EventId>;
  private _isActive: boolean;

  @pd.property({ type: String })
  title: string;

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(active: boolean) {
    this._isActive = active;
    if (active) {
      // An inactive page is usually not visible at all, so when it becomes active (and therefore
      // visible) the child elements should be given a chance to update their layout. However,
      // the resize notification must be delayed to allow the browser to update the size info of
      // this element, otherwise child elements will get stale size info for their parent elements.
      this.async(this.behavior.notifyResize, 1);
    }
  }

  created(): void {
    this._emitter = new EventEmitter<EventId>();
  }

  destroyed(): void {
    this._emitter.destroy();
    this._emitter = null;
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  /*
  factoryImpl(state?: IPageState): void {
    if (state) {
      this.title = state.title || this.title;
      this.isActive = (state.isActive !== undefined) ? state.isActive : false;
    }
  }
  */

  // override Polymer.IronResizableBehavior
  resizerShouldNotify(element: HTMLElement): boolean {
    // don't send resize events to descendants if the page is inactive
    return this.isActive;
  }

  close(): void {
    this._emitter.emit(EventId.DidClose, this);
  }

  onDidClose(handler: (page: IPageElement) => void): EventSubscription {
    return this._emitter.on(EventId.DidClose, handler);
  }

  @pd.listener('closeButton.tap')
  private _onDidTapCloseButton(): void {
    this.close();
  }
}

/**
 * Provides a more concise way to access methods of the base behavior from element classes that
 * override those methods.
 */
export var PageBehaviorPrototype = PageBehaviorImpl.prototype;
// When this module is loaded Polymer elements and behaviors may not have been loaded yet,
// so instead of exporting an array that may contain an undefined Polymer behavior export
// a function that can be used to retrieve the array after everything has been loaded.
/** Get an array of behaviors that provide the base functionality of page elements. */
export var PageBehavior = () => [Polymer.IronResizableBehavior, PageBehaviorImpl.prototype];
/** Interface that all page element classes must implement. */
export type IPageElement = typeof Polymer.IronResizableBehavior & PageBehaviorImpl;
