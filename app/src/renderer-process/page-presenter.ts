// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { IPageSetElement } from './elements/pages/page-set';
import { IPageElement } from './elements/pages/page';
import ElementFactory from './elements/element-factory';

/**
 * Creates and activates page elements.
 */
export class PagePresenter {
  private pageSets: IPageSetElement[] = [];
  private pageIdToElementMap = new Map</*pageId:*/string, { page: IPageElement, pageSet: IPageSetElement }>();
  private pageElementToIdMap = new Map<IPageElement, /*pageId:*/string>();
  private lastActivePageSet: IPageSetElement;

  // TODO: This pageSet property is just a temporary hack, at some point the presenter should be
  // able to work with multiple page sets (e.g. side-by-side pages), to do so it will need to
  // track all existing page sets somehow.
  get pageSet(): IPageSetElement {
    return this.lastActivePageSet;
  }

  set pageSet(pageSet: IPageSetElement) {
    this.lastActivePageSet = pageSet;
  }

  constructor(private elementFactory: ElementFactory) {
  }

  isPageOpen(pageId: string): boolean {
    return !!this.pageIdToElementMap.get(pageId);
  }

  /**
   * Open a new page in the most recently active page-set, or activate an existing page (it will
   * remain in the same page-set it was in).
   *
   * @param pageId Unique identifier for the page, if an existing page with this identifier already
   *               exists then it will be activated.
   * @param options.title Title of the new page.
   * @param options.content Callback that returns the content of the new page, this callback is
   *                        only invoked if a new page is created.
   */
  openPage(
    pageId: string,
    options: {
      title: string,
      content: () => HTMLElement
    }
  ): void {
    const entry = this.pageIdToElementMap.get(pageId);
    if (entry) {
      entry.pageSet.activatePage(entry.page);
    } else {
      const page = this.elementFactory.createPage({ title: options.title });
      page.onDidClose(pageElement => {
        const pageId = this.pageElementToIdMap.get(pageElement);
        if (pageId) {
          this.pageElementToIdMap.delete(pageElement);
          this.pageIdToElementMap.delete(pageId);
        }
      });
      page.appendChild(options.content());
      this.lastActivePageSet.addPage(page);
      this.pageIdToElementMap.set(pageId, { page, pageSet: this.lastActivePageSet });
      this.pageElementToIdMap.set(page, pageId);
      this.lastActivePageSet.activatePage(page);
    }
  }
}
