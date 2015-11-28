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
  width?: string;
  height?: string;
}

@pd.is('debug-workbench-vertical-container')
@pd.behaviors([SplittableBehavior, Polymer.IronResizableBehavior])
export class VerticalContainerElement implements ILayoutContainer {
  @pd.property({ type: String, value: undefined })
  width: string;
  @pd.property({ type: String, value: undefined })
  height: string;
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  static createSync(state?: IVerticalContainerState): IVerticalContainerElement {
    return RendererContext.get().elementFactory.createElementSync<IVerticalContainerElement>(
      (<any> VerticalContainerElement.prototype).is, state
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IVerticalContainerState): void {
    if (state) {
      this.width = (state.width !== undefined) ? state.width : this.width;
      this.height = (state.height !== undefined) ? state.height : this.height;
      this.resizable = (state.resizable !== undefined) ? state.resizable : this.resizable;
    }
  }

  attached(): void {
    self(this).createSplitters();
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    self(this).getContentChildren().forEach((child) => {
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
