// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import { ITree, ITreeItem } from './tree-view';
import { IDirectoryTreeViewItemElement } from './directory-tree-view-item';
import TreeViewBehavior from './tree-view';

export interface IDirectoryTreeViewState {
  tree: ITree;
  indent: number;
}

export type IDirectoryTreeViewElement = DirectoryTreeViewElement;

@pd.is('hydragon-directory-tree-view')
@pd.behaviors(() => [TreeViewBehavior])
@pd.hostAttributes({ 'tabindex': '0' })
export default class DirectoryTreeViewElement extends Polymer.BaseClass<any, TreeViewBehavior>() {
  /** Number of pixels to indent each level of the tree by. */
  @pd.property({ type: Number, value: 0 })
  indent: number;

  ready(): void {
    this.behavior.rootExcluded = true;
  }

  factoryImpl(state?: IDirectoryTreeViewState): void {
    if (state) {
      this.behavior.tree = state.tree;
      this.indent = (state.indent !== undefined) ? state.indent : this.indent;
    }
  }

  @pd.listener('tree-view-item-expand')
  private _onExpandItem(e: CustomEvent): void {
    e.stopPropagation();
    const element = <IDirectoryTreeViewItemElement> Polymer.dom(e).rootTarget;
    this.behavior.tree.expandItem(element.item);
  }

  @pd.listener('tree-view-item-collapse')
  private _onCollapseItem(e: CustomEvent): void {
    e.stopPropagation();
    const element = <IDirectoryTreeViewItemElement> Polymer.dom(e).rootTarget;
    this.behavior.tree.collapseItem(element.item);
  }

  computeIndent(level: number, indent: number) {
    return (this.behavior.rootExcluded ? (level - 1) : level) * indent;
  }
}
