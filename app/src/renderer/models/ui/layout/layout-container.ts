// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Observable, Subject, Subscription } from '@reactivex/rxjs';
import { observable } from 'mobx';
import { LayoutItemModel } from './layout-item';
import { SplitterOrientation, SplitterModel } from './splitter';

export type LayoutContainerDirection = 'vertical' | 'horizontal';

export interface ILayoutContainerParams {
  id: string;
  direction: LayoutContainerDirection;
  width?: string;
  height?: string;
  resizable?: boolean;
  /**
   * Stream that yields a `null` value whenever the browser window is resized.
   */
  windowDidResizeStream?: Observable<void>;
}

export class LayoutContainerModel extends LayoutItemModel {
  items: Array<LayoutItemModel | SplitterModel>;
  direction: LayoutContainerDirection;
  private containers: LayoutItemModel[];

  constructor({
    id, direction, width = undefined, height = undefined, resizable = false,
    windowDidResizeStream = undefined
  }: ILayoutContainerParams) {
    super(id);
    this.items = [];
    this.containers = [];
    this.direction = direction;
    this.width = width;
    this.height = height;
    this.resizable = resizable;
    if (windowDidResizeStream) {
      this.didResizeStreamSub = windowDidResizeStream.subscribe(this.didResizeStream);
    }
  }

  add(...items: LayoutItemModel[]): void {
    // when an item is added to a container the main axis size needs to be set so that the item
    // can be correctly resized along the container's main axis using a splitter (assuming the item
    // is marked as resizable)
    items.forEach(item => {
      if (this.direction === 'vertical') {
        if (item.height !== undefined) {
          item.mainAxisSize = item.height;
        }
      } else {
        if (item.width !== undefined) {
          item.mainAxisSize = item.width;
        }
      }
      this.containers.push(item);
      item.onDidAttachToContainer(this);
    });

    // create the splitters necessary to resize items that have been marked as such
    const orientation: SplitterOrientation = (this.direction === 'vertical') ? 'horizontal' : 'vertical';
    const allItems: Array<LayoutItemModel | SplitterModel> = [];
    for (let i = 0; i < this.containers.length; ++i) {
      const curItem = this.containers[i];
      // A splitter will explicitely resize the previous sibling, and the browser will resize
      // the following siblings using Flexbox. In order for a splitter to actually work the
      // previous sibling must be resizable, and at least one of the following siblings must
      // be resizable, if this is not the case there's no point in creating the splitter.
      if ((i > 0) && this.containers[i - 1].resizable && containsResizableItem(this.containers, i)) {
        allItems.push(new SplitterModel({ id: 'blah', orientation, resizee: this.containers[i - 1] }));
      }
      allItems.push(curItem);
    }
    this.items = allItems;
  }

  resizeItem(item: LayoutItemModel, newSize: string): void {
    item.mainAxisSize = newSize;
    this.didResizeStream.next(null);
  }
}

/** @return `true` iff at least one of the items in the given array is marked as resizable. */
function containsResizableItem<T extends { resizable?: boolean }>(
  items: LayoutItemModel[], startIndex: number
): boolean {
  for (let i = startIndex; i < items.length; ++i) {
    if (items[i].resizable) {
      return true;
    }
  }
  return false;
}
