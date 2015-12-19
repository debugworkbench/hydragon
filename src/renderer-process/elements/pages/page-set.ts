// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { IPageElement } from './page';
import { EventEmitter, EventSubscription } from '../../../common/events';

export interface ILocalDOM {
  ironPages: PolymerElements.IronPages;
}

export interface IPageSetState {
  activePageIndex?: number;
  width?: string;
  height?: string;
}

enum EventId {
  DidAddPage,
  DidRemovePage,
  DidActivatePage
}

export type IPageSetElement = PageSetElement;

@pd.is('debug-workbench-page-set')
export default class PageSetElement extends Polymer.BaseClass<ILocalDOM>() {
  width: string;
  height: string;

  private _emitter: EventEmitter<EventId>;
  private _pageSubscriptions: WeakMap<IPageElement, EventSubscription>;
  private _boundOnPageDidClose: (page: IPageElement) => void;

  get activePage(): IPageElement {
    const activePageIndex = <number> this.$.ironPages.selected;
    const pages = this.pages;
    if ((pages.length > 0) && (activePageIndex >= 0) && (activePageIndex < pages.length)) {
      return pages[activePageIndex];
    }
    return undefined;
  }

  get pages(): IPageElement[] {
    return <any> this.getContentChildren();
  }

  created(): void {
    this._emitter = new EventEmitter<EventId>();
    this._pageSubscriptions = new WeakMap();
    this._boundOnPageDidClose = this._onPageDidClose.bind(this);
  }

  destroyed(): void {
    this._emitter.destroy();
    this._emitter = null;
    for (const page of this.pages) {
      this._pageSubscriptions.get(page).destroy();
      this._pageSubscriptions.delete(page);
      page.destroyed();
    }
    this._boundOnPageDidClose = null;
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPageSetState): void {
    if (state) {
      this.width = state.width;
      this.height = state.height;

      if (this.width !== undefined) {
        this.style.width = this.width;
      }
      if (this.height !== undefined) {
        this.style.height = this.height;
      }
    }
  }

  addPage(page: IPageElement): void {
    this._pageSubscriptions.set(page, page.onDidClose(this._boundOnPageDidClose));
    Polymer.dom(this).appendChild(page);
    this._emitter.emit(EventId.DidAddPage, page);
    if (!this.activePage) {
      this.activatePage(page);
    }
  }

  removePage(page: IPageElement): void {
    this._pageSubscriptions.get(page).destroy();
    this._pageSubscriptions.delete(page);

    // if the active page is being removed figure out which page should be activated afterwards,
    // generally the previous page should be activated, unless there is no previous page (in which
    // case the next page should be activated)
    const pages = this.pages;
    let activePageIndex = <number> this.$.ironPages.selected;
    let shouldUpdateActivePage = (pages.indexOf(page) === activePageIndex);
    if (shouldUpdateActivePage) {
      if (pages.length === 1) {
        activePageIndex = undefined;
      } else if (activePageIndex > 0) {
        activePageIndex -= 1;
      }
    }

    Polymer.dom(<any> this).removeChild(page);
    if (shouldUpdateActivePage) {
      this._onlyActivatePageAtIndex(activePageIndex);
    }
    this._emitter.emit(EventId.DidRemovePage, page);
  }

  activatePage(page: IPageElement): void {
    this.activatePageAtIndex(this.pages.indexOf(page));
  }

  activatePageAtIndex(pageIndex: number): void {
    const activePageIndex = this.$.ironPages.selected;
    if (activePageIndex !== pageIndex) {
      if (activePageIndex !== undefined) {
        this.pages[<number> activePageIndex].isActive = false;
      }
      this._onlyActivatePageAtIndex(pageIndex);
    }
  }

  private _onlyActivatePageAtIndex(pageIndex: number): void {
    this.$.ironPages.selected = pageIndex;
    if (pageIndex !== undefined) {
      const page = this.pages[pageIndex];
      page.isActive = true;
      this._emitter.emit(EventId.DidActivatePage, page);
    }
  }

  activateNextPage(): void {
    const activePageIndex = <number> this.$.ironPages.selected;
    if ((activePageIndex !== undefined) && (activePageIndex < this.pages.length - 1)) {
      this.activatePageAtIndex(activePageIndex + 1);
    } else if (this.pages.length > 0) {
      this.activatePageAtIndex(0);
    }
  }

  activatePreviousPage(): void {
    const activePageIndex = <number> this.$.ironPages.selected;
    if ((activePageIndex !== undefined) && (activePageIndex > 0)) {
      this.activatePageAtIndex(activePageIndex - 1);
    } else if (this.pages.length > 0) {
      this.activatePageAtIndex(this.pages.length - 1);
    }
  }

  onDidAddPage(handler: (page: IPageElement) => void): EventSubscription {
    return this._emitter.on(EventId.DidAddPage, handler);
  }

  onDidRemovePage(handler: (page: IPageElement) => void): EventSubscription {
    return this._emitter.on(EventId.DidRemovePage, handler);
  }

  onDidActivatePage(handler: (page: IPageElement) => void): EventSubscription {
    return this._emitter.on(EventId.DidActivatePage, handler);
  }

  private _onPageDidClose(page: IPageElement): void {
    this.removePage(page);
    page.destroyed();
  }
}
