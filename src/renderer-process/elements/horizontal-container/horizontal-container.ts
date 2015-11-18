// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';
import { SplittableBehavior } from '../behaviors/splittable';
import { RendererContext } from '../../renderer-context';

function self(element: HorizontalContainerElement): IHorizontalContainerElement {
  return <any> element;
}

export type IHorizontalContainerElement =
  HorizontalContainerElement & SplittableBehavior & polymer.Base;

@pd.is('debug-workbench-horizontal-container')
@pd.behavior(SplittableBehavior)
export class HorizontalContainerElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height

  curWidth: number;
  curHeight: number;

  static createSync(): IHorizontalContainerElement {
    return RendererContext.get().elementFactory.createElementSync<IHorizontalContainerElement>(
      (<any> HorizontalContainerElement.prototype).is
    );
  }

  attached(): void {
    self(this).createSplitters(true);
  }

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
    // the container must be wide enough to fit all child elements, however, if any of the child
    // elements have no set width then the container can't have a set width either
    const children = self(this).getContentChildren();
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

  adjustHeight(delta: number): void {
    // ignore
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    self(this).getContentChildren().forEach((child) => {
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
