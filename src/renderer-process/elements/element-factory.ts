// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import ElementRegistry from './element-registry';
import WorkspaceElement, { IWorkspaceElement } from './workspace/workspace';
import VerticalContainerElement, { IVerticalContainerElement, IVerticalContainerState } from './vertical-container/vertical-container';
import HorizontalContainerElement, { IHorizontalContainerElement } from './horizontal-container/horizontal-container';
import PanelElement, { IPanelElement, IPanelState } from './panel/panel';
import SplitterElement, { ISplitterElement } from './splitter/splitter';
import CodeMirrorEditorElement, { ICodeMirrorEditorElement } from './code-mirror-editor/code-mirror-editor';
import PageElement, { IPageElement, IPageState } from './pages/page';
import PageSetElement, { IPageSetElement, IPageSetState } from './pages/page-set';
import PageTreeElement, { IPageTreeElement, IPageTreeState } from './pages/page-tree';
import PageTreeItemElement, { IPageTreeItemElement } from './pages/page-tree-item';
import DirectoryTreeViewElement, { IDirectoryTreeViewElement, IDirectoryTreeViewState } from './tree-view/directory-tree-view';
import DirectoryTreeViewItemElement, { IDirectoryTreeViewItemElement } from './tree-view/directory-tree-view-item';

/**
 * Creates new instances of custom elements.
 */
export default class ElementFactory {
  constructor(private _elementRegistry: ElementRegistry) {
  }

  createWorkspace(): IWorkspaceElement {
    return this._createElement((<any> WorkspaceElement.prototype).is, this);
  }

  createVerticalContainer(state?: IVerticalContainerState): IVerticalContainerElement {
    return this._createElement((<any> VerticalContainerElement.prototype).is, this, state);
  }

  createHorizontalContainer(): IHorizontalContainerElement {
    return this._createElement((<any> HorizontalContainerElement.prototype).is, this);
  }

  createPanel(state?: IPanelState): IPanelElement {
    return this._createElement((<any> PanelElement.prototype).is, state);
  }

  createSplitter(vertical?: boolean): ISplitterElement {
    return this._createElement((<any> SplitterElement.prototype).is, vertical);
  }

  createCodeMirrorEditor(config?: CodeMirror.EditorConfiguration): ICodeMirrorEditorElement {
    return this._createElement((<any> CodeMirrorEditorElement.prototype).is, config);
  }

  createPage(state?: IPageState): IPageElement {
    return this._createElement((<any> PageElement.prototype).is, state);
  }

  createPageSet(state?: IPageSetState): IPageSetElement {
    return this._createElement((<any> PageSetElement.prototype).is, state);
  }

  createPageTree(state?: IPageTreeState): IPageTreeElement {
    return this._createElement((<any> PageTreeElement.prototype).is, this, state);
  }

  createPageTreeItem(page: IPageElement): IPageTreeItemElement {
    return this._createElement((<any> PageTreeItemElement.prototype).is, page);
  }

  createDirectoryTreeView(state?: IDirectoryTreeViewState): IDirectoryTreeViewElement {
    return this._createElement((<any> DirectoryTreeViewElement.prototype).is, state);
  }

  createDirectoryTreeViewItem(): IDirectoryTreeViewItemElement {
    return this._createElement((<any> DirectoryTreeViewItemElement.prototype).is);
  }

  /**
   * Create a new instance of a custom element.
   *
   * @param tagName The name of a previously registered custom element.
   * @return A new custom element instance.
   */
  private _createElement(tagName: string, ...args: any[]): any {
    const elementConstructor = this._elementRegistry.getElementConstructor(tagName);
    if (elementConstructor) {
      // invoke the constructor with the given args
      // TODO: in ES6 this can be simplified to Reflect.construct(elementConstructor, args),
      //       but have to wait for Chrome and Electron to support it.
      return new (Function.prototype.bind.apply(elementConstructor, [null].concat(args)));
    }
    throw new Error(`No constructor was found for element <${tagName}>.`);
  }
}
