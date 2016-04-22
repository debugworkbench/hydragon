// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable, autorun, Lambda } from 'mobx';
import { Subject, Observable, Subscription } from '@reactivex/rxjs';
import PageModel from './page';
import { PanelModel, IPanelItem } from '../layout/panel';

export interface IPageSetParams {
  id: string;
  width?: string;
  height?: string;
}

export default class PageSetModel implements IPanelItem {
  id: string;
  width: string;
  height: string;
  didResizeStream = new Subject<void>();

  @observable
  pages: PageModel<any>[] = [];

  @observable
  activePage: PageModel<any> = null;

  // FIXME: these three subjects aren't actually used by anything right now, consider removing them
  didAddPageStream = new Subject<PageModel<any>>();
  didRemovePageStream = new Subject<PageModel<any>>();
  didActivatePageStream = new Subject<PageModel<any>>();

  private activePageIndex: number;
  private panelDidResizeStreamSub: Subscription;

  constructor({ id, width = undefined, height = undefined }: IPageSetParams) {
    this.id = id;
    this.width = width;
    this.height = height;
  }

  addPage(page: PageModel<any>): void {
    this.pages.push(page);
    page.onDidAttachToPageSet(this);
    const sub = page.didCloseStream.subscribe(page => {
      this.removePage(page);
      sub.unsubscribe();
    });
    this.didAddPageStream.next(page);

    if (!this.activePage) {
      this.activatePage(page);
    }
  }

  removePage(page: PageModel<any>): void {
    // if the active page is being removed figure out which page should be activated afterwards,
    // generally the previous page should be activated, unless there is no previous page (in which
    // case the next page should be activated)
    const removedPageIdx = this.pages.indexOf(page);
    let shouldUpdateActivePage = (removedPageIdx <= this.activePageIndex);
    let nextActivePageIdx: number;
    if (shouldUpdateActivePage) {
      if (this.pages.length === 1) {
        nextActivePageIdx = undefined;
      } else {
        nextActivePageIdx = (this.activePageIndex > 0) ? (this.activePageIndex - 1) : 0;
      }
    }

    this.pages.splice(removedPageIdx, 1);
    page.onDidDetachFromPageSet();

    if (shouldUpdateActivePage) {
      this.activatePageAtIndex(nextActivePageIdx);
    }
    this.didRemovePageStream.next(page);
  }

  activatePage(page: PageModel<any>): void {
    this.activatePageAtIndex(this.pages.indexOf(page));
  }

  private activatePageAtIndex(pageIndex: number): void {
    const pageToActivate = (pageIndex !== undefined) ? this.pages[pageIndex] : null;
    if (pageToActivate !== this.activePage) {
      this.activePageIndex = pageIndex;
      this.activePage = pageToActivate;
      this.didActivatePageStream.next(this.activePage);
    }
  }

  activateNextPage(): void {
    if ((this.activePageIndex !== undefined) && (this.activePageIndex < this.pages.length - 1)) {
      this.activatePageAtIndex(this.activePageIndex + 1);
    } else if (this.pages.length > 0) {
      this.activatePageAtIndex(0);
    }
  }

  activatePreviousPage(): void {
    if ((this.activePageIndex !== undefined) && (this.activePageIndex > 0)) {
      this.activatePageAtIndex(this.activePageIndex - 1);
    } else if (this.pages.length > 0) {
      this.activatePageAtIndex(this.pages.length - 1);
    }
  }

  onDidAttachToPanel(panel: PanelModel): void {
    this.panelDidResizeStreamSub = panel.didResizeStream.subscribe(this.didResizeStream);
  }
}
