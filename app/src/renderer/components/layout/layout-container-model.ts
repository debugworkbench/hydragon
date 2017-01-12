// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable, Subject, Subscription } from '@reactivex/rxjs';
import * as mobx from 'mobx';
import { ILayoutItemModel } from './layout-item-model';
import { PanelModel } from './panel-model';
import { SplitterOrientation, SplitterModel } from './splitter-model';
import { ComponentModel } from '../component-model';
import {
  WidgetPath, IWidget, WidgetChange
} from '../../../display-server';

export type LayoutContainerDirection = 'vertical' | 'horizontal';

export interface ILayoutContainerParams {
  id: string;
  widgetPath: WidgetPath;
  direction: LayoutContainerDirection;
  width?: string;
  height?: string;
  resizable?: boolean;
  items?: ILayoutItemModel[];
}

export class LayoutContainerModel extends ComponentModel implements ILayoutItemModel {
  @mobx.observable
  direction: LayoutContainerDirection;
  @mobx.observable
  width: string;
  @mobx.observable
  height: string;
  @mobx.observable
  resizable: boolean;
  @mobx.observable
  items: Array<LayoutContainerModel | PanelModel | SplitterModel>;

  //private _disposeItemsObserver: mobx.Lambda;
  private _containers: ILayoutItemModel[];

  constructor({
    id, widgetPath, direction, width, height, resizable = false, items
  }: ILayoutContainerParams) {
    super(id, widgetPath);
    this.items = [];
    this._containers = [];
    this.direction = direction;
    this.width = width;
    this.height = height;
    this.resizable = resizable;
    if (items) {
      this.append(...items);
    }
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
  @mobx.action
  append(...items: ILayoutItemModel[]): void {
    this._containers = this._containers.concat(items);
    // create the splitters necessary to resize items that have been marked as such
    const orientation: SplitterOrientation =
      (this.direction === 'vertical') ? 'horizontal' : 'vertical';
    const allItems: Array<ILayoutItemModel | SplitterModel> = [];
    let nextSplitterId = 0;
    for (let i = 0; i < this._containers.length; ++i) {
      const curItem = this._containers[i];
      // A splitter will explicitely resize the previous sibling, and the browser will resize
      // the following siblings using Flexbox. In order for a splitter to actually work the
      // previous sibling must be resizable, and at least one of the following siblings must
      // be resizable, if this is not the case there's no point in creating the splitter.
      if ((i > 0)
          && this._containers[i - 1].resizable
          && containsResizableItem(this._containers, i)) {
        allItems.push(new SplitterModel({
          id: `splitter-${nextSplitterId}`,
          orientation,
          resizeeId: this._containers[i - 1].id
        }));
        ++nextSplitterId;
      }
      allItems.push(curItem);
    }
    if (mobx.isObservableArray(this.items)) {
      this.items.replace(allItems);
    }
  }

  applyWidgetChange(change: WidgetChange, deserialize: (widget: IWidget) => any): void {
    if (change.path.length > this.widgetPath.length) {
      const propertyName = change.path[this.widgetPath.length];
      // The display server client is unaware of the existence of splitters, so if the change
      // needs to be applied to one of the contained items the index into the items array must be
      // adjusted to ignore the splitters.
      if (propertyName === 'items') {
        if (change.path.length > (this.widgetPath.length + 1)) {
          const idx = change.path[this.widgetPath.length + 1];
          if (Number.isSafeInteger(idx)) {
            const newPath = change.path.slice();
            newPath[this.widgetPath.length + 1] = this.items.indexOf(<any>(this._containers[idx]));
            change = { ...<any>change, path: newPath };
          } else {
            throw new Error(`${idx} is not a valid array index.`);
          }
        }
      }
    }
    super.applyWidgetChange(change, deserialize);
  }
}

/** @return `true` iff at least one of the items in the given array is marked as resizable. */
function containsResizableItem<T extends { resizable?: boolean }>(
  items: ILayoutItemModel[], startIndex: number
): boolean {
  for (let i = startIndex; i < items.length; ++i) {
    if (items[i].resizable) {
      return true;
    }
  }
  return false;
}
