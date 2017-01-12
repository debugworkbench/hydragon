// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { ComponentModel } from '../component-model';
import { LayoutContainerModel } from '../layout/layout-container-model';
import { WidgetPath, IWidget, WidgetChange } from '../../../display-server';

export class WindowModel extends ComponentModel {
  @mobx.observable
  layout: LayoutContainerModel;

  //private _disposeLayoutObserver: mobx.Lambda;

  constructor(params: {
    id: string;
    widgetPath: WidgetPath;
    layout: LayoutContainerModel
  }) {
    super(params.id, params.widgetPath);
    this.layout = params.layout;
    /*
    this._disposeLayoutObserver = mobx.autorun(() => {
      this.layout.parent = this;
      this.layout.relativePath = ['layout'];
    });
    */
  }
/*
  dispose(): void {
    if (this._disposeLayoutObserver) {
      this._disposeLayoutObserver();
      this._disposeLayoutObserver = null;
    }
  }
*/
}
