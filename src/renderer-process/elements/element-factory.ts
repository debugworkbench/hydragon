// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import ElementRegistry from './element-registry';
import WorkspaceElement, { IWorkspaceElement, IWorkspaceElementOptions } from './workspace/workspace';
import VerticalContainerElement, { IVerticalContainerElement, IVerticalContainerState } from './layout/vertical-container/vertical-container';
import HorizontalContainerElement, { IHorizontalContainerElement } from './layout/horizontal-container/horizontal-container';
import PanelElement, { IPanelElement, IPanelState } from './layout/panel/panel';
import SplitterElement, { ISplitterElement } from './layout/splitter/splitter';
import CodeMirrorEditorElement, { ICodeMirrorEditorElement } from './code-mirror-editor/code-mirror-editor';
import DebugToolbarElement, { IDebugToolbarElement } from './debug-toolbar/debug-toolbar';
import NewDebugConfigDialogElement, { INewDebugConfigDialogElement } from './new-debug-config-dialog/new-debug-config-dialog';
import GdbMiDebugConfigElement, { IGdbMiDebugConfigElement } from './gdb-mi-debug-config/gdb-mi-debug-config';
import PageElement, { IPageElement, IPageState } from './pages/page';
import PageSetElement, { IPageSetElement, IPageSetState } from './pages/page-set';
import PageTreeElement, { IPageTreeElement, IPageTreeState } from './pages/page-tree';
import PageTreeItemElement, { IPageTreeItemElement } from './pages/page-tree-item';
import DirectoryTreeViewElement, { IDirectoryTreeViewElement, IDirectoryTreeViewState } from './tree-view/directory-tree-view';
import DirectoryTreeViewItemElement, { IDirectoryTreeViewItemElement } from './tree-view/directory-tree-view-item';
import DebugConfigManager from '../debug-config-manager';
import DebugConfigPresenter from '../debug-config-presenter';
import { IDebugConfig } from 'debug-engine';

/**
 * Creates new instances of custom elements.
 */
export default class ElementFactory {
  constructor(private elementRegistry: ElementRegistry) {
  }

  createWorkspace(options: IWorkspaceElementOptions): IWorkspaceElement {
    options.elementFactory = this;
    return this._createElement((<any> WorkspaceElement.prototype).is, options);
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

  createDebugToolbar(debugConfigManager: DebugConfigManager, debugConfigPresenter: DebugConfigPresenter): IDebugToolbarElement {
    return this._createElement((<any> DebugToolbarElement.prototype).is, debugConfigManager, debugConfigPresenter);
  }

  createNewDebugConfigDialog(): INewDebugConfigDialogElement {
    return this._createElement((<any> NewDebugConfigDialogElement.prototype).is);
  }

  createGdbMiDebugConfig(debugConfigManager: DebugConfigManager, debugConfig: IDebugConfig): IGdbMiDebugConfigElement {
    return this._createElement((<any> GdbMiDebugConfigElement.prototype).is, debugConfigManager, debugConfig);
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
    const elementConstructor = this.elementRegistry.getElementConstructor(tagName);
    if (elementConstructor) {
      // invoke the constructor with the given args
      // TODO: in ES6 this can be simplified to Reflect.construct(elementConstructor, args),
      //       but have to wait for Chrome and Electron to support it.
      return new (Function.prototype.bind.apply(elementConstructor, [null].concat(args)));
    }
    throw new Error(`No constructor was found for element <${tagName}>.`);
  }
}
