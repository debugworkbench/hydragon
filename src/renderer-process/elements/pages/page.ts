// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';

interface ILocalDOM {
  toolbar: HTMLElement;
  contentWrapper: HTMLElement;
}

function $(element: PageElement): ILocalDOM {
  return (<any> element).$;
}

function self(element: PageElement): IPageElement {
  return <any> element;
}

export type IPageElement = PageElement & polymer.Base;

export interface IPageState {
  title?: string;
  isActive?: boolean;
}

@pd.is('debug-workbench-page')
@pd.behavior(Polymer.IronResizableBehavior)
export class PageElement {
  @pd.property({ type: String, value: '' })
  title: string;

  isActive: boolean;

  static createSync(state?: IPageState): IPageElement {
    return RendererContext.get().elementFactory.createElementSync<IPageElement>(
      (<any> PageElement.prototype).is, state
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPageState): void {
    if (state) {
      this.title = state.title || this.title;
      this.isActive = (state.isActive !== undefined) ? state.isActive : false;
    }
  }

  resizerShouldNotify(element: HTMLElement): boolean {
    // don't send resize events to descendants if the page is inactive
    return this.isActive;
  }
}

export function register(): typeof PageElement {
  return Polymer<typeof PageElement>(PageElement.prototype);
}
