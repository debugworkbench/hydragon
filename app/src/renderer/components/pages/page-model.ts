// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import * as mobx from 'mobx';
import { PageSetModel } from './page-set-model';

export class PageModel {
  id: string;
  title: string;

  /** The page-set this page is attached to (if any). */
  @mobx.observable
  pageSet: PageSetModel = null;
  /**
   * Indicates whether or not there are unsaved changes on the page.
   * `true` means there are unsaved changes, `false` means there aren't, the default implementation
   * always returns `false` but subclasses may override this method.
   * This is a mobx computed property.
   */
  @mobx.computed
  get isDirty(): boolean {
    return false;
  }

  didCloseStream = new Subject<PageModel>();
  didResizeStream = new Subject<void>();

  private _pageSetDidResizeStreamSub: Subscription = null;
  private _disposeAutorun: mobx.Lambda;

  constructor({ id }: PageModel.IConstructorParams) {
    this.id = id;
    this._disposeAutorun = mobx.autorun(() => {
      if (this.pageSet) {
        this._pageSetDidResizeStreamSub = this.pageSet.didResizeStream.subscribe(this.didResizeStream);
      } else if (this._pageSetDidResizeStreamSub) {
        this._pageSetDidResizeStreamSub.unsubscribe();
      }
    });
  }

  dispose(): void {
    this._disposeAutorun();
  }

  close(): void {
    this.pageSet = null;
    this.didCloseStream.next(this);
  }
}

export namespace PageModel {
  export interface IConstructorParams {
    id: string;
  }
}
