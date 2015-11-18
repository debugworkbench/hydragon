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
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height
  @pd.property({ type: Boolean, value: false, reflectToAttribute: true })
  resizable: boolean;

  curWidth: number;
  curHeight: number;

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
    }
  }

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
  }

  adjustWidth(delta: number): void {
    this.curWidth = self(this).clientWidth + delta;
    // TODO: check for min/max width
    if (this.curWidth < 0) {
      this.curWidth = 0;
    }
  }

  adjustHeight(delta: number): void {
    this.curHeight = self(this).clientHeight + delta;
    // TODO: check for min/max height
    if (this.curHeight < 0) {
      this.curHeight = 0;
    }
  }

  updateStyle(): void {
    // nothing to do yet
  }
}

export function register(): typeof PanelElement {
  return Polymer<typeof PanelElement>(PanelElement.prototype);
}
