// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import PageComponent from '../../../components/pages/page';
import PageSetModel from './page-set';

export default class PageModel<TComponentClass> {
  ComponentClass: TComponentClass;

  title: string;

  didCloseStream = new Subject<PageModel<TComponentClass>>();
  didResizeStream = new Subject<void>();

  private pageSetDidResizeStreamSub: Subscription;

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
