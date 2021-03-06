// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { WorkspaceModel, PageSetModel, PageModel } from './components/models';

/**
 * Creates and activates page elements.
 */
export class PagePresenter {
  private pageIdToModelMap = new Map</*pageId:*/string, { page: PageModel, pageSet: PageSetModel }>();
  private lastActivePageSet: PageSetModel;
  private disposeObserver: mobx.Lambda;

  // TODO: Need to watch out for page sets being created and destroyed and update
  //       pageIdToElementMap accordingly.
  constructor(private workspace: WorkspaceModel) {
    this.disposeObserver = mobx.autorun(() => {
      this.lastActivePageSet = this.workspace.activePageSet;
    });
  }

  dispose(): void {
    this.disposeObserver();
  }

  isPageOpen(pageId: string): boolean {
    return !!this.pageIdToModelMap.get(pageId);
  }

  /**
   * Open a new page in the most recently active page-set, or activate an existing page (it will
   * remain in the same page-set it was in).
   *
   * @param pageId Unique identifier for the page, if an existing page with this identifier already
   *               exists then it will be activated.
   * @param createPage Callback that returns the content of the new page, this callback is only
   *                   invoked when a new page is created.
   */
  @mobx.action
  async openPage(pageId: string, createPage: () => Promise<PageModel>): Promise<void> {
    const entry = this.pageIdToModelMap.get(pageId);
    if (entry) {
      entry.pageSet.activatePage(entry.page);
    } else {
      const page = await createPage();
      const sub = page.didCloseStream.subscribe(page => {
        this.pageIdToModelMap.delete(pageId);
        sub.unsubscribe();
      });
      mobx.runInAction('add page to most recently active page-set', () => {
        this.lastActivePageSet.addPage(page);
        this.pageIdToModelMap.set(pageId, { page, pageSet: this.lastActivePageSet });
        this.lastActivePageSet.activatePage(page);
      });
    }
  }
}
