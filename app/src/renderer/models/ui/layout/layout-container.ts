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
  children: LayoutItemModel[];
  direction: LayoutContainerDirection;

  constructor({
    id, direction, width = undefined, height = undefined, resizable = false,
    windowDidResizeStream = undefined
  }: ILayoutContainerParams) {
    super(id);
    this.children = [];
    this.direction = direction;
    this.width = width;
    this.height = height;
    this.resizable = resizable;
    if (windowDidResizeStream) {
      this.didResizeStreamSub = windowDidResizeStream.subscribe(this.didResizeStream);
    }
  }

  add(...children: LayoutItemModel[]): void {
    // FIXME: this is going to explode if called more that once!
    const orientation: SplitterOrientation = (this.direction === 'vertical') ? 'horizontal' : 'vertical';
    for (let i = 0; i < children.length; ++i) {
      const curChild = children[i];
      // A splitter will explicitely resize the previous sibling, and the browser will resize
      // the following siblings using Flexbox. In order for a splitter to actually work the
      // previous sibling must be resizable, and at least one of the following siblings must
      // be resizable, if this is not the case there's no point in creating the splitter.
      if ((i > 0) && children[i - 1].resizable && containsResizableItem(children, i)) {
        this.children.push(new SplitterModel({ id: 'blah', orientation, resizee: children[i - 1] }));
      }
      this.children.push(curChild);
      if (this.direction === 'vertical') {
        if (curChild.height !== undefined) {
          curChild.mainAxisSize = curChild.height;
        }
      } else {
        if (curChild.width !== undefined) {
          curChild.mainAxisSize = curChild.width;
        }
      }
      curChild.onDidAttachToContainer(this);
    }
  }

  resizeChild(child: LayoutItemModel, newSize: string): void {
    child.mainAxisSize = newSize;
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
