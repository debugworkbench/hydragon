// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { ComponentModel } from './component-model';
import { WidgetPath } from '../../display-server';

export class ToolbarModel extends ComponentModel {
  @mobx.observable
  items: Array<ComponentModel>;

  //private _disposeItemsObserver: mobx.Lambda;

  constructor(params: {
    id: string;
    widgetPath: WidgetPath;
    items?: Array<ComponentModel>;
  }) {
    super(params.id, params.widgetPath);
    this.items = params.items || [];
    /*
    this._disposeItemsObserver = mobx.autorun(() => {
      for (let i = 0; i < this.items.length; ++i) {
        this.items[i].parent = this;
        this.items[i].relativePath = ['items', i];
      }
    });
    */
  }

/*
  dispose(): void {
    if (this._disposeItemsObserver) {
      this._disposeItemsObserver();
      this._disposeItemsObserver = null;
    }
  }
*/
}
