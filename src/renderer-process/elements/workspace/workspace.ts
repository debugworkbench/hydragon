// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { HorizontalContainerElement, IHorizontalContainerElement } from '../horizontal-container/horizontal-container';
import { VerticalContainerElement } from '../vertical-container/vertical-container';
import { PanelElement } from '../panel/panel';
import { PageElement } from '../pages/page';
import { CodeMirrorEditorElement, ICodeMirrorEditorElement } from '../code-mirror-editor/code-mirror-editor';

interface ILocalDOM {

}

function $(element: WorkspaceElement): ILocalDOM {
  return (<any> element).$;
}

function self(element: WorkspaceElement): IWorkspaceElement {
  return <any> element;
}

export type IWorkspaceElement = WorkspaceElement & typeof Polymer.IronResizableBehavior & polymer.Base;

@pd.is('debug-workbench-workspace')
@pd.behavior(Polymer.IronResizableBehavior)
export class WorkspaceElement {
  private _rootContainer: IHorizontalContainerElement;

  static createSync(): IWorkspaceElement {
    return RendererContext.get().elementFactory.createElementSync<IWorkspaceElement>(
      (<any> WorkspaceElement.prototype).is
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(): void {
    this._rootContainer = HorizontalContainerElement.createSync();
    const leftPanel = PanelElement.createSync({ width: '300px', resizable: true });
    const rightContainer = VerticalContainerElement.createSync({ resizable: true });
    const documentPanel = PanelElement.createSync();
    const page1 = PageElement.createSync({ title: 'Test Page' });
    const statusPanel = PanelElement.createSync({ height: '20px' });

    const editorElement1 = CodeMirrorEditorElement.createSync({
      value: 'int main(int argc, char** argv) {}',
      mode: 'text/x-c++src'
    });
    statusPanel.innerText = 'Status';

    Polymer.dom(page1).appendChild(editorElement1);
    Polymer.dom(documentPanel).appendChild(page1);
    Polymer.dom(rightContainer).appendChild(documentPanel);
    Polymer.dom(rightContainer).appendChild(statusPanel);
    Polymer.dom(this._rootContainer).appendChild(leftPanel);
    Polymer.dom(this._rootContainer).appendChild(rightContainer);
    Polymer.dom(<any> this).appendChild(this._rootContainer);
  }

  attached(): void {
    this.updateStyle();
    self(this).async(() => {
      self(this).notifyResize();
    }, 10);
  }

  updateStyle(): void {
    const container: ILayoutContainer & HTMLElement = <any> self(this).getContentChildren()[0];

    if (container.width !== undefined) {
      container.style.flex = `0 0 ${container.width}px`;
    }

    container.updateStyle();
  }
}

export function register(): typeof WorkspaceElement {
  return Polymer<typeof WorkspaceElement>(WorkspaceElement.prototype);
}
