// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { Subject } from '@reactivex/rxjs';
import PageModel from './page';

export default class PageSetModel {
  @observable
  pages: PageModel<any>[] = [];

  @observable
  activePage: PageModel<any> = null;

  didAddPageStream = new Subject<PageModel<any>>();
  didRemovePageStream = new Subject<PageModel<any>>();
  didActivatePageStream = new Subject<PageModel<any>>();

  private activePageIndex: number;

  addPage(page: PageModel<any>): void {
    this.pages.push(page);
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
      } else if (this.activePageIndex > 0) {
        nextActivePageIdx -= 1;
      }
    }

    this.pages.splice(removedPageIdx, 1);

    if (shouldUpdateActivePage) {
      this.activatePageAtIndex(nextActivePageIdx);
    }
    this.didRemovePageStream.next(page);
  }

  activatePage(page: PageModel<any>): void {
    this.activatePageAtIndex(this.pages.indexOf(page));
  }

  private activatePageAtIndex(pageIndex: number): void {
    if (this.activePageIndex !== pageIndex) {
      this.activePage = (pageIndex !== undefined) ? this.pages[pageIndex] : null;
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
}
