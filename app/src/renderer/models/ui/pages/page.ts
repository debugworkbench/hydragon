// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { PageSetModel } from './page-set';

export class PageModel {
  id: string;
  title: string;

  didCloseStream = new Subject<PageModel>();
  didResizeStream = new Subject<void>();

  private pageSetDidResizeStreamSub: Subscription;

  constructor({ id }: PageModel.IConstructorParams) {
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

export namespace PageModel {
  export interface IConstructorParams {
    id: string;
  }
}
