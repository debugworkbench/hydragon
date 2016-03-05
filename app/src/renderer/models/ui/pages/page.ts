// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject } from '@reactivex/rxjs';
import PageComponent from '../../../components/pages/page';

export default class PageModel<TComponentClass> {
  ComponentClass: TComponentClass;

  title: string;

  didCloseStream = new Subject<PageModel<TComponentClass>>();

  close(): void {
    this.didCloseStream.next(this);
  }
}
