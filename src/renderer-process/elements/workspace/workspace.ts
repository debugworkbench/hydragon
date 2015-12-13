// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { HorizontalContainerElement, IHorizontalContainerElement } from '../horizontal-container/horizontal-container';
import { VerticalContainerElement } from '../vertical-container/vertical-container';
import { PanelElement } from '../panel/panel';
import { PageElement } from '../pages/page';
import { PageSetElement } from '../pages/page-set';
import { PageTreeElement } from '../pages/page-tree';
import { CodeMirrorEditorElement, ICodeMirrorEditorElement } from '../code-mirror-editor/code-mirror-editor';
import { DirectoryTree } from '../tree-view/directory-tree';
import { DirectoryTreeViewElement } from '../tree-view/directory-tree-view';

export type IBehaviors = typeof Polymer.IronResizableBehavior;
export type IWorkspaceElement = WorkspaceElement & IBehaviors;

@pd.is('debug-workbench-workspace')
@pd.behaviors(() => [Polymer.IronResizableBehavior])
export class WorkspaceElement extends Polymer.BaseClass<any, IBehaviors>() {
  private _rootContainer: IHorizontalContainerElement;
  private _directoryTree: DirectoryTree;

  static createSync(): IWorkspaceElement {
    return RendererContext.get().elementFactory.createElementSync<IWorkspaceElement>(
      (<any> WorkspaceElement.prototype).is
    );
  }

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(): void {
    this._rootContainer = HorizontalContainerElement.createSync();
    const leftContainer = VerticalContainerElement.createSync({ width: '300px', resizable: true });
    const rightContainer = VerticalContainerElement.createSync({ resizable: true });
    const pageTreePanel = PanelElement.createSync({ height: '300px', resizable: true });
    const dirTreePanel = PanelElement.createSync({ height: '300px', resizable: true });
    const documentPanel = PanelElement.createSync();
    const pageSet = PageSetElement.createSync({ height: '100%' });
    const pageTree = PageTreeElement.createSync({ height: '100%' });
    pageTree.pageSet = pageSet;
    const page1 = PageElement.createSync({ title: 'Test Page' });
    const page2 = PageElement.createSync({ title: 'Test Page 2' });
    const statusPanel = PanelElement.createSync({ height: '20px' });

    const editorElement1 = CodeMirrorEditorElement.createSync({
      value: 'int main(int argc, char** argv) {}',
      mode: 'text/x-c++src'
    });
    const editorElement2 = CodeMirrorEditorElement.createSync({
      value: 'int main(int argc, char** argv) { return 0; }',
      mode: 'text/x-c++src'
    });
    statusPanel.innerText = 'Status';

    this._directoryTree = new DirectoryTree();
    const dirTreeView = DirectoryTreeViewElement.createSync({ tree: this._directoryTree, indent: 25 });

    Polymer.dom(page1).appendChild(editorElement1);
    Polymer.dom(page2).appendChild(editorElement2);
    pageSet.addPage(page1);
    pageSet.addPage(page2);
    Polymer.dom(pageTreePanel).appendChild(pageTree);
    Polymer.dom(dirTreePanel).appendChild(dirTreeView);
    Polymer.dom(documentPanel).appendChild(pageSet);
    Polymer.dom(leftContainer).appendChild(pageTreePanel);
    Polymer.dom(leftContainer).appendChild(dirTreePanel);
    Polymer.dom(rightContainer).appendChild(documentPanel);
    Polymer.dom(rightContainer).appendChild(statusPanel);
    Polymer.dom(this._rootContainer).appendChild(leftContainer);
    Polymer.dom(this._rootContainer).appendChild(rightContainer);
    Polymer.dom(<any> this).appendChild(this._rootContainer);
  }

  attached(): void {
    this.updateStyle();
    this.async(() => {
      this._directoryTree.addDirectory('.');
      this.behavior.notifyResize();
    }, 10);
  }

  updateStyle(): void {
    const container: ILayoutContainer & HTMLElement = <any> this.getContentChildren()[0];

    if (container.width !== undefined) {
      container.style.flex = `0 0 ${container.width}px`;
    }

    container.updateStyle();
  }
}

export function register(): typeof WorkspaceElement {
  return Polymer<typeof WorkspaceElement>(WorkspaceElement.prototype);
}
