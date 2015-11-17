// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';
import { SplittableBehavior } from '../behaviors/splittable';

function base(element: VerticalContainerElement): VerticalContainerElement & SplittableBehavior & polymer.Base {
  return <any> element;
}

@pd.is('debug-workbench-vertical-container')
@pd.behavior(SplittableBehavior)
export class VerticalContainerElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height

  curWidth: number;
  curHeight: number;

  attached(): void {
    base(this).createSplitters();
  }

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
    // the container must be high enough to fit all child elements, however, if any of the child
    // elements have no set height then the container can't have a set height either
    const children = base(this).getContentChildren();
    let autoHeight = false;
    for (let i = 0; i < children.length; ++i) {
      if (!(children[i] instanceof SplitterElement)) {
        const container: ILayoutContainer = <any> children[i];
        container.calculateSize();
        if (!autoHeight) {
          if (this.curHeight !== undefined) {
            if (container.curHeight === undefined) {
              autoHeight = true;
              this.curHeight = undefined;
            } else {
              this.curHeight += container.curHeight;
            }
          } else if (container.curHeight !== undefined) {
            this.curHeight = container.curHeight;
          }
        }
      }
    }
  }

  adjustWidth(delta: number): void {
    // ignore
  }

  adjustHeight(delta: number): void {
    // TODO
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    base(this).getContentChildren().forEach((child) => {
      if (!(child instanceof SplitterElement)) {
        const container: ILayoutContainer = <any> child;
        if (container.curHeight === undefined) {
          child.style.flex = "1 1 auto";
        } else {
          child.style.flex = `0 0 ${container.curHeight}px`;
        }
        container.updateStyle();
      }
    });
  }
}

export function register(): typeof VerticalContainerElement {
  return Polymer<typeof VerticalContainerElement>(VerticalContainerElement.prototype);
}
