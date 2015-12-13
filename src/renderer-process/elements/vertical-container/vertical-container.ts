// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';
import { SplittableBehavior } from '../behaviors/splittable';
import ElementFactory from '../element-factory';

export type IBehaviors = SplittableBehavior & typeof Polymer.IronResizableBehavior;
export type IVerticalContainerElement = VerticalContainerElement & IBehaviors;

export interface IVerticalContainerState {
  resizable?: boolean;
  width?: string;
  height?: string;
}

@pd.is('debug-workbench-vertical-container')
@pd.behaviors(() => [SplittableBehavior, Polymer.IronResizableBehavior])
export class VerticalContainerElement extends Polymer.BaseClass<any, IBehaviors>() implements ILayoutContainer {
  @pd.property({ type: String, value: undefined })
  width: string;
  @pd.property({ type: String, value: undefined })
  height: string;
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  private _elementFactory: ElementFactory;

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(elementFactory: ElementFactory, state?: IVerticalContainerState): void {
    this._elementFactory = elementFactory;
    if (state) {
      this.width = (state.width !== undefined) ? state.width : this.width;
      this.height = (state.height !== undefined) ? state.height : this.height;
      this.resizable = (state.resizable !== undefined) ? state.resizable : this.resizable;
    }
  }

  attached(): void {
    this.behavior.createSplitters(this._elementFactory);
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    this.getContentChildren().forEach((child) => {
      if (!(child instanceof SplitterElement)) {
        const childContainer: ILayoutContainer = <any> child;
        // By default all children will have "flex: 1 1 auto" so their height will be computed
        // using Flexbox, however if an explicit height is set for a child then the child should
        // always maintain that exact height even if this container is resized.
        if (childContainer.height !== undefined) {
          child.style.flex = `0 0 ${childContainer.height}`;
        }
        childContainer.updateStyle();
      }
    });
  }
}

export function register(): typeof VerticalContainerElement {
  return Polymer<typeof VerticalContainerElement>(VerticalContainerElement.prototype);
}
