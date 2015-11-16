// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';

function base(element: HorizontalContainerElement): polymer.Base {
  return <any> element;
}

@pd.is('debug-workbench-horizontal-container')
export class HorizontalContainerElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height

  curWidth: number;
  curHeight: number;

  attached(): void {
    base(this).async(() => {
      // insert splitters between child elements
      const lightDom = Polymer.dom(<any> this);
      if (lightDom.children.length > 1) {
        for (let i = 1; i < lightDom.children.length; ++i) {
          const curChild: ILayoutContainer = <any> lightDom.children[i];
          // TODO: check that the previous child is resizable, if it isn't there's no need to
          //       insert a splitter after it
          lightDom.insertBefore(SplitterElement.createSync(true), lightDom.children[i]);
          ++i; // adjust the iterator to account for the newly inserted splitter element
        }
      }
    });
  }

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
    // the container must be wide enough to fit all child elements, however, if any of the child
    // elements have no set width then the container can't have a set width either
    const children = base(this).getContentChildren();
    let autoWidth = false;
    for (let i = 0; i < children.length; ++i) {
      if (!(children[i] instanceof SplitterElement)) {
        const container: ILayoutContainer = <any> children[i];
        container.calculateSize();
        if (!autoWidth) {
          if (this.curWidth !== undefined) {
            if (container.curWidth === undefined) {
              autoWidth = true;
              this.curWidth = undefined;
            } else {
              this.curWidth += container.curWidth;
            }
          } else if (container.curWidth !== undefined) {
            this.curWidth = container.curWidth;
          }
        }
      }
    }
  }

  adjustWidth(delta: number): void {
    // TODO
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    base(this).getContentChildren().forEach((child) => {
      if (!(child instanceof SplitterElement)) {
        const container: ILayoutContainer = <any> child;
        if (container.curWidth === undefined) {
          child.style.flex = "1 1 auto";
        } else {
          child.style.flex = `0 0 ${container.curWidth}px`;
        }
        container.updateStyle();
      }
    });
  }
}

export function register(): typeof HorizontalContainerElement {
  return Polymer<typeof HorizontalContainerElement>(HorizontalContainerElement.prototype);
}
