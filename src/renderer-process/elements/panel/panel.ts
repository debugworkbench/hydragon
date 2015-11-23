// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';

function self(element: PanelElement): IPanelElement {
  return <any> element;
}

export type IPanelElement = PanelElement & polymer.Base;

export interface IPanelState {
  width?: number;
  height?: number;
  resizable?: boolean;
}

@pd.is('debug-workbench-panel')
export class PanelElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number;
  @pd.property({ type: Number, value: undefined })
  height: number;
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  static createSync(state?: IPanelState): IPanelElement {
    return RendererContext.get().elementFactory.createElementSync<IPanelElement>(
      (<any> PanelElement.prototype).is, state
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPanelState): void {
    if (state) {
      this.width = state.width;
      this.height = state.height;
      this.resizable = state.resizable || this.resizable;

      if (state.width !== undefined) {
        self(this).style.width = `${state.width}px`;
      }
      if (state.height !== undefined) {
        self(this).style.height = `${state.height}px`;
      }
    }
  }

  updateStyle(): void {
    // this element doesn't impose any styling on its children
  }
}

export function register(): typeof PanelElement {
  return Polymer<typeof PanelElement>(PanelElement.prototype);
}
