// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';

function base(element: PanelElement): polymer.Base {
  return <any> element;
}

@pd.is('debug-workbench-panel')
export class PanelElement implements ILayoutContainer {
  @pd.property({ type: Number, value: undefined })
  width: number; // initial width
  @pd.property({ type: Number, value: undefined })
  height: number; // initial height

  curWidth: number;
  curHeight: number;

  calculateSize(): void {
    this.curWidth = this.width;
    this.curHeight = this.height;
  }

  adjustWidth(delta: number): void {
    this.curWidth = base(this).clientWidth + delta;
    // TODO: check for min/max width
    if (this.curWidth < 0) {
      this.curWidth = 0;
    }
  }

  adjustHeight(delta: number): void {
    this.curHeight = base(this).clientHeight + delta;
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
