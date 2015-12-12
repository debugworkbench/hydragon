// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { EventSubscription, EventEmitter } from '../../../common/events';

export interface ILocalDOM {
  toolbar: HTMLElement;
  contentWrapper: HTMLElement;
  closeButton: PolymerElements.PaperIconButton;
}

enum EventId {
  DidClose
}

export type IBehaviors = typeof Polymer.IronResizableBehavior;
export type IPageElement = PageElement & IBehaviors;

export interface IPageState {
  title?: string;
  isActive?: boolean;
}

@pd.is('debug-workbench-page')
@pd.behavior(Polymer.IronResizableBehavior)
export class PageElement extends Polymer.BaseClass<ILocalDOM, IBehaviors>() {
  @pd.property({ type: String, value: '' })
  title: string;

  private _emitter: EventEmitter<EventId>;
  private _isActive: boolean;

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

  static createSync(state?: IPageState): IPageElement {
    return RendererContext.get().elementFactory.createElementSync<IPageElement>(
      (<any> PageElement.prototype).is, state
    );
  }

  created(): void {
    this._emitter = new EventEmitter<EventId>();
  }

  destroyed(): void {
    this._emitter.destroy();
    this._emitter = null;
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPageState): void {
    if (state) {
      this.title = state.title || this.title;
      this.isActive = (state.isActive !== undefined) ? state.isActive : false;
    }
  }

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
  private _onCloseButtonPressed(): void {
    this.close();
  }
}

export function register(): typeof PageElement {
  return Polymer<typeof PageElement>(PageElement.prototype);
}
