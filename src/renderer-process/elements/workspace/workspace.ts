// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';

interface ILocalDOM {

}

function $(element: WorkspaceElement): ILocalDOM {
  return (<any> element).$;
}

function base(element: WorkspaceElement): polymer.Base {
  return <any> element;
}

@pd.is('debug-workbench-workspace')
export class WorkspaceElement {
  attached(): void {
    base(this).async(() => {
      this.calculateSize();
      this.updateStyle();
    });
  }

  calculateSize(): void {
    const layoutContainer: ILayoutContainer = <any> base(this).getContentChildren()[0];
    layoutContainer.calculateSize();
  }

  updateStyle(): void {
    const container: ILayoutContainer & HTMLElement = <any> base(this).getContentChildren()[0];

    if (container.curWidth === undefined) {
      container.style.flex = "1 1 auto";
    } else {
      container.style.flex = `0 0 ${container.curWidth}px`;
    }

    container.updateStyle();
  }
}

export function register(): typeof WorkspaceElement {
  return Polymer<typeof WorkspaceElement>(WorkspaceElement.prototype);
}
