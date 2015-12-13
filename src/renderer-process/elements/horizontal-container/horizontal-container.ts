// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { SplitterElement } from '../splitter/splitter';
import { SplittableBehavior } from '../behaviors/splittable';
import { RendererContext } from '../../renderer-context';

export type IBehaviors = SplittableBehavior & typeof Polymer.IronResizableBehavior;
export type IHorizontalContainerElement = HorizontalContainerElement & IBehaviors;

@pd.is('debug-workbench-horizontal-container')
@pd.behaviors(() => [SplittableBehavior, Polymer.IronResizableBehavior])
export class HorizontalContainerElement extends Polymer.BaseClass<any, IBehaviors>() implements ILayoutContainer {
  @pd.property({ type: String, value: undefined })
  width: string;
  @pd.property({ type: String, value: undefined })
  height: string;

  static createSync(): IHorizontalContainerElement {
    return RendererContext.get().elementFactory.createElementSync<IHorizontalContainerElement>(
      (<any> HorizontalContainerElement.prototype).is
    );
  }

  attached(): void {
    // FIXME: new splitters may need to be created whenever new children are attached,
    // it's not sufficient to just create them when this element is attached
    this.behavior.createSplitters(true);
  }

  updateStyle(): void {
    // this element's flex style should have already been set by the parent,
    // so all that remains is to update the flex styles of all the children
    this.getContentChildren().forEach((child) => {
      if (!(child instanceof SplitterElement)) {
        const childContainer: ILayoutContainer = <any> child;
        // By default all children will have "flex: 1 1 auto" so their width will be computed
        // using Flexbox, however if an explicit width is set for a child then the child should
        // always maintain that exact width even if this container is resized.
        if (childContainer.width !== undefined) {
          child.style.flex = `0 0 ${childContainer.width}`;
        }
        childContainer.updateStyle();
      }
    });
  }
}

export function register(): typeof HorizontalContainerElement {
  return Polymer<typeof HorizontalContainerElement>(HorizontalContainerElement.prototype);
}
