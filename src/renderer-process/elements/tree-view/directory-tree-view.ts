// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { RendererContext } from '../../renderer-context';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import { ITree, ITreeItem } from './tree-view';
import { IDirectoryTreeViewItemElement } from './directory-tree-view-item';

export interface IDirectoryTreeViewState {
  tree: ITree;
  indent: number;
}

export type IDirectoryTreeViewElement = DirectoryTreeViewElement;

@pd.is('hydragon-directory-tree-view')
@pd.hostAttributes({ 'tabindex': '0' })
export class DirectoryTreeViewElement extends Polymer.BaseClass() {
  @pd.property({ type: Object })
  tree: ITree;
  /** This should never be set directly, it will be managed by the child TreeViewElement. */
  @pd.property({ type: Array })
  items: ITreeItem[];
  /** Number of pixels to indent each level of the tree by. */
  @pd.property({ type: Number, value: 0 })
  indent: number;

  static createSync(state?: IDirectoryTreeViewState): IDirectoryTreeViewElement {
    return RendererContext.get().elementFactory.createElementSync<IDirectoryTreeViewElement>(
      (<any> DirectoryTreeViewElement.prototype).is, state
    );
  }

  factoryImpl(state?: IDirectoryTreeViewState): void {
    if (state) {
      this.tree = state.tree;
      this.indent = (state.indent !== undefined) ? state.indent : this.indent;
    }
  }

  @pd.listener('tree-view-item-expand')
  private _onExpandItem(e: CustomEvent): void {
    e.stopPropagation();
    const element = <IDirectoryTreeViewItemElement> Polymer.dom(e).rootTarget;
    this.tree.expandItem(element.item);
  }

  @pd.listener('tree-view-item-collapse')
  private _onCollapseItem(e: CustomEvent): void {
    e.stopPropagation();
    const element = <IDirectoryTreeViewItemElement> Polymer.dom(e).rootTarget;
    this.tree.collapseItem(element.item);
  }

  computeIndent(level: number, indent: number) {
    return level * indent;
  }
}

export function register(): typeof DirectoryTreeViewElement {
  return Polymer<typeof DirectoryTreeViewElement>(DirectoryTreeViewElement.prototype);
}
