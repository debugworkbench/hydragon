// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import PageComponent from '../../../components/pages/page';
import PageSetModel from './page-set';

export interface IPageParams {
  id: string;
}

export default class PageModel {
  id: string;
  title: string;

  didCloseStream = new Subject<PageModel>();
  didResizeStream = new Subject<void>();

  private pageSetDidResizeStreamSub: Subscription;

  constructor({ id }: IPageParams) {
    this.id = id;
  }

  close(): void {
    if (this.pageSetDidResizeStreamSub) {
      this.pageSetDidResizeStreamSub.unsubscribe();
    }
    this.didCloseStream.next(this);
  }

  onDidAttachToPageSet(pageSet: PageSetModel): void {
    this.pageSetDidResizeStreamSub = pageSet.didResizeStream.subscribe(this.didResizeStream);
  }

  onDidDetachFromPageSet(): void {
    this.pageSetDidResizeStreamSub.unsubscribe();
  }
}
