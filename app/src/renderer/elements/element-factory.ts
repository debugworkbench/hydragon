// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import ElementRegistry from './element-registry';
import SplitterElement, { ISplitterElement } from './layout/splitter/splitter';
import CodeMirrorEditorElement, { ICodeMirrorEditorElement } from './code-mirror-editor/code-mirror-editor';
import NewDebugConfigDialogElement, { INewDebugConfigDialogElement } from './new-debug-config-dialog/new-debug-config-dialog';
import DirectoryTreeViewElement, { IDirectoryTreeViewElement, IDirectoryTreeViewState } from './tree-view/directory-tree-view';
import DirectoryTreeViewItemElement, { IDirectoryTreeViewItemElement } from './tree-view/directory-tree-view-item';

/**
 * Creates new instances of custom elements.
 */
export default class ElementFactory {
  constructor(private elementRegistry: ElementRegistry) {
  }

  createSplitter(vertical?: boolean): ISplitterElement {
    return this._createElement((<any> SplitterElement.prototype).is, vertical);
  }

  createCodeMirrorEditor(config?: CodeMirror.EditorConfiguration): ICodeMirrorEditorElement {
    return this._createElement((<any> CodeMirrorEditorElement.prototype).is, config);
  }

  createNewDebugConfigDialog(): INewDebugConfigDialogElement {
    return this._createElement((<any> NewDebugConfigDialogElement.prototype).is);
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
