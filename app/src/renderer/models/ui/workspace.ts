// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { Subject } from '@reactivex/rxjs';
import PageSetModel from './pages/page-set';

export default class WorkspaceModel {
  /** Most recently active page-set. */
  @observable
  activePageSet: PageSetModel = null;

  mainPageSet: PageSetModel = null;

  createDefaultLayout(): void {
    this.mainPageSet = new PageSetModel();
    this.activePageSet = this.mainPageSet;
  }
}
