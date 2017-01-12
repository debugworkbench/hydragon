// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import {
  IWidget, WidgetPath, WidgetEventKind, IDidSelectDropdownItemEvent,
  WidgetChange, PatchOperation
} from '../../display-server';
import { ComponentModel } from './component-model';

export class DropdownModel extends ComponentModel {
  @mobx.observable
  label: string;

  @mobx.observable
  selectedItemIndex: number;

  @mobx.observable
  items: Array<any>;

  private _emitEvent: (event: IDidSelectDropdownItemEvent) => void;

  constructor(params: {
    id: string;
    widgetPath: WidgetPath,
    label?: string;
    selectedItemIndex?: number;
    items?: Array<any>;
    emitEvent: (event: IDidSelectDropdownItemEvent) => void;
  }) {
    super(params.id, params.widgetPath);
    this.label = params.label || null;
    this.selectedItemIndex = (params.selectedItemIndex !== undefined)
      ? params.selectedItemIndex
      : null;
    this.items = (params.items !== undefined) ? params.items : null;
    this._emitEvent = params.emitEvent;
  }

  applyWidgetChange(change: WidgetChange, deserialize: (widget: IWidget) => any): void {
    if (change.path.length > this.widgetPath.length) {
      const propertyName = change.path[this.widgetPath.length];
      // rename selectionIndex -> selectedItemIndex
      if ((change.op === PatchOperation.ReplaceValue) && (propertyName === 'selectionIndex')) {
        const newPath = change.path.slice();
        newPath[this.widgetPath.length] = 'selectedItemIndex';
        change = { ...<any>change, path: newPath };
      }
    }
    super.applyWidgetChange(change, deserialize);
  }

  onDidSelectItem(itemIndex: number): void {
    this._emitEvent({
      kind: WidgetEventKind.DidSelectDropdownItem,
      path: [...this.widgetPath],
      itemIndex,
      itemId: this.items[itemIndex].id
    });
  }
}
