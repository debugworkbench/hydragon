// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';

interface ILocalDOM {

}

function $(element: WorkspaceElement): ILocalDOM {
  return (<any> element).$;
}

function self(element: WorkspaceElement): IWorkspaceElement {
  return <any> element;
}

export type IWorkspaceElement = WorkspaceElement & polymer.Base;

@pd.is('debug-workbench-workspace')
export class WorkspaceElement {
  static createSync(): IWorkspaceElement {
    return RendererContext.get().elementFactory.createElementSync<IWorkspaceElement>(
      (<any> WorkspaceElement.prototype).is
    );
  }

  attached(): void {
    self(this).async(() => {
      this.calculateSize();
      this.updateStyle();
    });
  }

  calculateSize(): void {
    const layoutContainer: ILayoutContainer = <any> self(this).getContentChildren()[0];
    layoutContainer.calculateSize();
  }

  updateStyle(): void {
    const container: ILayoutContainer & HTMLElement = <any> self(this).getContentChildren()[0];

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
