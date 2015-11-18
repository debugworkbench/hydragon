// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';
import { SplittableBehavior } from '../behaviors/splittable';
import { RendererContext } from '../../renderer-context';

function self(element: VerticalContainerElement): IVerticalContainerElement {
  return <any> element;
}

export type IVerticalContainerElement =
  VerticalContainerElement & SplittableBehavior & polymer.Base;

export interface IVerticalContainerState {
  resizable?: boolean;
}

@pd.is('debug-workbench-vertical-container')
@pd.behavior(SplittableBehavior)
export class VerticalContainerElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  curWidth: number;
  curHeight: number;

  static createSync(state?: IVerticalContainerState): IVerticalContainerElement {
    return RendererContext.get().elementFactory.createElementSync<IVerticalContainerElement>(
      (<any> VerticalContainerElement.prototype).is, state
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IVerticalContainerState): void {
    if (state) {
      this.resizable = state.resizable || this.resizable;
    }
  }

  attached(): void {
    self(this).createSplitters();
  }

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
    // the container must be high enough to fit all child elements, however, if any of the child
    // elements have no set height then the container can't have a set height either
    const children = self(this).getContentChildren();
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
    self(this).getContentChildren().forEach((child) => {
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
