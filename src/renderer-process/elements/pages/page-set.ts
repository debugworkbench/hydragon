// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { IPageElement } from './page';
import { EventEmitter, EventSubscription } from '../../../common/events';

interface ILocalDOM {
  ironPages: PolymerElements.IronPages;
}

function $(element: PageSetElement): ILocalDOM {
  return (<any> element).$;
}

function self(element: PageSetElement): IPageSetElement {
  return <any> element;
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

export type IPageSetElement = PageSetElement & polymer.Base;

@pd.is('debug-workbench-page-set')
export class PageSetElement {
  private _emitter: EventEmitter<EventId>;
  width: string;
  height: string;

  get activePage(): IPageElement {
    const activePageIndex = <number> $(this).ironPages.selected;
    const pages = this.pages;
    if ((pages.length > 0) && (activePageIndex >= 0) && (activePageIndex < pages.length)) {
      return pages[activePageIndex];
    }
    return undefined;
  }

  get pages(): IPageElement[] {
    return <any> self(this).getContentChildren();
  }

  static createSync(state?: IPageSetState): IPageSetElement {
    return RendererContext.get().elementFactory.createElementSync<IPageSetElement>(
      (<any> PageSetElement.prototype).is, state
    );
  }

  created(): void {
    this._emitter = new EventEmitter<EventId>();
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPageSetState): void {
    if (state) {
      this.width = state.width;
      this.height = state.height;

      if (this.width !== undefined) {
        self(this).style.width = this.width;
      }
      if (this.height !== undefined) {
        self(this).style.height = this.height;
      }
    }
  }

  addPage(page: IPageElement): void {
    Polymer.dom(<any> this).appendChild(page);
    this._emitter.emit(EventId.DidAddPage, page);
    if (!this.activePage) {
      this.activatePage(page);
    }
  }

  activatePage(page: IPageElement): void {
    this.activatePageAtIndex(this.pages.indexOf(page));
  }

  activatePageAtIndex(pageIndex: number): void {
    const ironPages = $(this).ironPages;
    const activePageIndex = ironPages.selected;
    if (activePageIndex !== pageIndex) {
      if (activePageIndex !== undefined) {
        this.pages[<number> activePageIndex].isActive = false;
      }
      const page = this.pages[pageIndex];
      page.isActive = true;
      ironPages.selected = pageIndex;
      this._emitter.emit(EventId.DidActivatePage, page);
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
}

export function register(): typeof PageSetElement {
  return Polymer<typeof PageSetElement>(PageSetElement.prototype);
}
