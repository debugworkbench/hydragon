// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable, autorun, transaction } from 'mobx';
import PageSetModel from './page-set';
import PageModel from './page';
import { PanelModel, IPanelItem } from '../layout/panel';

export interface IPageTreeParams {
  id: string;
  width?: string;
  height?: string;
}

export class PageTreeModel implements IPanelItem {
  id: string;
  width: string;
  height: string;

  @observable
  pageSet: PageSetModel = null;

  @observable
  pages: PageModel<any>[] = [];

  @observable
  activePage: PageModel<any> = null;

  constructor({ id, width = undefined, height = undefined }: IPageTreeParams) {
    this.id = id;
    this.width = width;
    this.height = height;

    autorun(() => {
      if (this.pageSet) {
        transaction(() => {
          this.pages = this.pageSet.pages;
          this.activePage = this.pageSet.activePage;
        });
      } else {
        transaction(() => {
          this.pages = [];
          this.activePage = null;
        });
      }
    });
  }

  activatePage(page: PageModel<any>): void {
    this.pageSet.activatePage(page);
  }

  onDidAttachToPanel(panel: PanelModel): void {
  }
}
