// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { IPageElement } from './page';

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

type IPageSetElement = PageSetElement & polymer.Base;

@pd.is('debug-workbench-page-set')
export class PageSetElement {
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
      this.pages[pageIndex].isActive = true;
      ironPages.selected = pageIndex;
    }
  }
}

export function register(): typeof PageSetElement {
  return Polymer<typeof PageSetElement>(PageSetElement.prototype);
}
