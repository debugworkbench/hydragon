// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { computed } from 'mobx';
import { PageSetModel } from './page-set';

export class PageModel {
  id: string;
  title: string;
  /**
   * Indicates whether or not there are unsaved changes on the page.
   * `true` means there are unsaved changes, `false` means there aren't, the default implementation
   * always returns `false` but subclasses may override this method.
   * This is a mobx computed property.
   */
  @computed
  get isDirty(): boolean {
    return false;
  }

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
