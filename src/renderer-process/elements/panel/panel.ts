// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';

export type IPanelElement = PanelElement;

export interface IPanelState {
  width?: string;
  height?: string;
  resizable?: boolean;
}

@pd.is('debug-workbench-panel')
export default class PanelElement extends Polymer.BaseClass() implements ILayoutContainer {
  @pd.property({ type: String, value: undefined })
  width: string;
  @pd.property({ type: String, value: undefined })
  height: string;
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(state?: IPanelState): void {
    if (state) {
      this.width = state.width;
      this.height = state.height;
      this.resizable = state.resizable || this.resizable;

      if (state.width !== undefined) {
        this.style.width = `${state.width}`;
      }
      if (state.height !== undefined) {
        this.style.height = `${state.height}`;
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
