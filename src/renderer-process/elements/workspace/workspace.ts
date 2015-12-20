// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { IHorizontalContainerElement } from '../horizontal-container/horizontal-container';
import { DirectoryTree } from '../tree-view/directory-tree';
import ElementFactory from '../element-factory';

export type IBehaviors = typeof Polymer.IronResizableBehavior;
export type IWorkspaceElement = WorkspaceElement & IBehaviors;

@pd.is('debug-workbench-workspace')
@pd.behaviors(() => [Polymer.IronResizableBehavior])
export default class WorkspaceElement extends Polymer.BaseClass<any, IBehaviors>() {
  private _rootContainer: IHorizontalContainerElement;
  private _directoryTree: DirectoryTree;

  /** Called after ready() with arguments passed to the element constructor function. */
  factoryImpl(elementFactory: ElementFactory): void {
    this._rootContainer = elementFactory.createHorizontalContainer();
    const leftContainer = elementFactory.createVerticalContainer({ width: '300px', resizable: true });
    const rightContainer = elementFactory.createVerticalContainer({ resizable: true });
    const pageTreePanel = elementFactory.createPanel({ height: '300px', resizable: true });
    const dirTreePanel = elementFactory.createPanel({ resizable: true });
    const documentPanel = elementFactory.createPanel();
    const pageSet = elementFactory.createPageSet({ height: '100%' });
    const pageTree = elementFactory.createPageTree({ height: '100%' });
    pageTree.pageSet = pageSet;
    const page1 = elementFactory.createPage({ title: 'Test Page' });
    const page2 = elementFactory.createPage({ title: 'Test Page 2' });
    const statusPanel = elementFactory.createPanel({ height: '20px' });

    const editorElement1 = elementFactory.createCodeMirrorEditor({
      value: 'int main(int argc, char** argv) {}',
      mode: 'text/x-c++src'
    });
    const editorElement2 = elementFactory.createCodeMirrorEditor({
      value: 'int main(int argc, char** argv) { return 0; }',
      mode: 'text/x-c++src'
    });
    statusPanel.innerText = 'Status';

    this._directoryTree = new DirectoryTree();
    const dirTreeView = elementFactory.createDirectoryTreeView({ tree: this._directoryTree, indent: 25 });

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
