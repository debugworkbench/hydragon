// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { ILayoutItemModel } from './layout-item-model';
import { ComponentModel } from '../component-model';
import { WidgetPath } from '../../../display-server';

export class PanelModel extends ComponentModel implements ILayoutItemModel {
  @mobx.observable
  title: string;
  @mobx.observable
  width: string;
  @mobx.observable
  height: string;
  @mobx.observable
  resizable: boolean;
  @mobx.observable
  showHeader: boolean;
  @mobx.observable
  items: ComponentModel[];

  //private _disposeItemsObserver: mobx.Lambda;

  constructor(params: {
    id: string;
    widgetPath: WidgetPath;
    title?: string;
    width?: string;
    height?: string;
    resizable?: boolean;
    showHeader?: boolean;
    items: ComponentModel[];
  }) {
    super(params.id, params.widgetPath);
    this.title = (params.title !== undefined) ? params.title : null;
    this.width = (params.width !== undefined) ? params.width : null;
    this.height = (params.height !== undefined) ? params.height : null;
    this.resizable = params.resizable === true;
    this.showHeader = params.showHeader === true;
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
