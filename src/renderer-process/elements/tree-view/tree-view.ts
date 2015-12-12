// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { RendererContext } from '../../renderer-context';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';

export interface ITree {
  root: ITreeItem;

  onDidExpandItem(handler: (item: ITreeItem) => void): EventSubscription;
  onWillCollapseItem(handler: (item: ITreeItem) => void): EventSubscription;
  onDidCollapseItem(handler: (item: ITreeItem) => void): EventSubscription;
  /**
   * Add an event handler to be invoked before a new item is inserted into the tree.
   * Note that the item passed to the handler will already have a parent set (unless it's the root)
   * but it won't actually be attached to the parent as yet.
   */
  onWillAddItem(handler: (item: ITreeItem) => void): EventSubscription;
  onDidRemoveItem(handler: (item: ITreeItem) => void): EventSubscription;

  expandItem(item: ITreeItem): Promise<void>;
  collapseItem(item: ITreeItem): Promise<void>;
}

export interface ITreeItem {
  title: string;
  parent?: ITreeItem;
  children: ITreeItem[];
  hasChildren: boolean;
  expanded: boolean;
  expandable: boolean;
  level: number;
}

export type ITreeViewElement = TreeViewElement;

// FIXME: This doesn't have a visual representation of any kind, perhaps it's better off being a behavior?
//        As a behavior there'd be less binding required to get it working.
@pd.is('hydragon-tree-view')
export class TreeViewElement extends Polymer.BaseClass() {
  @pd.property({ type: Object, observer: '_treeChanged' })
  tree: ITree;
  /** Array that will contain the result of flattening the current tree into a list. */
  @pd.property({ type: Array, notify: true })
  items: ITreeItem[];
  /** Set to `true` to exclude the tree root from the generated [[items]] array, defaults to `false`. */
  @pd.property({ type: Boolean, value: false })
  rootExcluded: boolean;

  private _itemIndices: Map<ITreeItem, number>;
  private _subscriptions: EventSubscriptionSet;

  static createSync(): ITreeViewElement {
    return RendererContext.get().elementFactory.createElementSync<ITreeViewElement>(
      (<any> TreeViewElement.prototype).is
    );
  }

  created(): void {
    this._itemIndices = new Map();
    this._subscriptions = new EventSubscriptionSet();
  }

  destroyed(): void {
    this._subscriptions.destroy();
    this._subscriptions = null;
  }

  private _treeChanged(newTree: ITree, oldTree: ITree): void {
    this._subscriptions.clear();
    this._subscriptions.add(newTree.onDidExpandItem(this._onDidExpandItem.bind(this)));
    this._subscriptions.add(newTree.onWillCollapseItem(this._onWillCollapseItem.bind(this)));
    this._subscriptions.add(newTree.onDidCollapseItem(this._onDidCollapseItem.bind(this)));
    this._subscriptions.add(newTree.onWillAddItem(this._onWillAddItem.bind(this)));
    this._subscriptions.add(newTree.onDidRemoveItem(this._onDidRemoveItem.bind(this)));

    if (newTree.root) {
      let flattenedItems: ITreeItem[] = [];
      if (!this.rootExcluded) {
        flattenedItems = [newTree.root];
        this._itemIndices.set(newTree.root, 0);
      }
      this._flattenSubTree(newTree.root, flattenedItems);
      this.items = flattenedItems;
    } else {
      this.items = [];
    }
  }

  private _flattenSubTree(rootItem: ITreeItem, flattenedItems: ITreeItem[]): void {
    // traverse the tree in depth-first order (skipping collapsed sub-trees)
    if (rootItem.expanded && rootItem.hasChildren) {
      rootItem.children.forEach((item) => {
        this._itemIndices.set(item, flattenedItems.length);
        flattenedItems.push(item);
        this._flattenSubTree(item, flattenedItems);
      });
    }
  }

  private _onDidExpandItem(item: ITreeItem): void {
    const flattenedItems: ITreeItem[] = [];
    this._flattenSubTree(item, flattenedItems);
    this._addItems(item, flattenedItems);
    // force update of computed bindings that depend on item.expanded
    this.set(['items', this._itemIndices.get(item), 'expanded'], item.expanded);
  }

  private _onWillCollapseItem(item: ITreeItem): void {
    if (item.hasChildren) {
      this._spliceItems(this._itemIndices.get(item) + 1, this._getSubTreeSize(item));
    }
  }

  private _onDidCollapseItem(item: ITreeItem): void {
    // force update of computed bindings that depend on item.expanded
    this.set(['items', this._itemIndices.get(item), 'expanded'], item.expanded);
  }

  private _onWillAddItem(item: ITreeItem): void {
    const flattenedItems = [item];
    this._flattenSubTree(item, flattenedItems);

    if (item.parent) {
      // FIXME: can't just call getLastSubTreeItem() since the order of siblings will depend on the sort order
      this._addItems(getLastSubTreeItem(item.parent), flattenedItems);
    } else {
      this.tree.root = item;
      this.items = flattenedItems;
    }
  }

  private _onDidRemoveItem(item: ITreeItem): void {
    if (item.expanded && item.hasChildren) {
      this._removeItems(item, this._getSubTreeSize(item));
    } else {
      this._removeItems(item, 1);
    }
  }

  private _onDidChangeItem(item: ITreeItem): void {
    this.set(['items', this._itemIndices.get(item)], item);
  }

  private _addItems(start: ITreeItem, items: ITreeItem[]): void {
    if (this.rootExcluded && (start === this.tree.root)) {
      this._spliceItems(0, 0, items);
    } else {
      this._spliceItems(this._itemIndices.get(start) + 1, 0, items);
    }
  }

  private _removeItems(start: ITreeItem, deleteCount: number): void {
    this._spliceItems(this._itemIndices.get(start), deleteCount);
  }

  private _spliceItems(startIndex: number, deleteCount: number, newItems?: ITreeItem[]): void {
    for (let i = startIndex; i < startIndex + deleteCount; ++i) {
      this._itemIndices.delete(this.items[i]);
    }
    if (newItems) {
      for (let i = 0; i < newItems.length; ++i) {
        this._itemIndices.set(newItems[i], startIndex + i);
      }
    }
    // after items are removed and/or inserted from/into `this.items` the indices of all the items
    // in the array following the splice range will shift by a fixed amount, so the indices
    // stored for those items in `this._itemIndices` must be updated match the post-splice layout
    // of `this.items`
    const firstStaleIndex = startIndex + deleteCount;
    const deltaIndex = (newItems ? newItems.length : 0) - deleteCount;
    for (let i = firstStaleIndex; i < this.items.length; ++i) {
      this._itemIndices.set(this.items[i], i + deltaIndex);
    }
    if (newItems) {
      this.splice('items', startIndex, deleteCount, ...newItems);
    } else {
      this.splice('items', startIndex, deleteCount);
    }
  }

  /**
   * Count how many nodes there are in the given sub-tree (excluding the sub-tree root).
   * Note that only the expanded sections of the sub-tree will be traversed, so any nodes in
   * collapsed sections of the sub-tree will not be counted.
   * @param rootItem The root of the sub-tree to traverse, this item must be in [[this.items]].
   * @return The number of nodes in the sub-tree.
   */
  private _getSubTreeSize(rootItem: ITreeItem): number {
    const lastItem = getLastSubTreeItem(rootItem);
    const indices = this._itemIndices;
    return (rootItem === lastItem) ? 0 : (indices.get(lastItem) - indices.get(rootItem));
  }
}

/**
 * Find the last item (deepest and rightmost) in the given sub-tree.
 * Note that only the expanded sections of the sub-tree will be traversed, so any nodes in
 * collapsed sections of the sub-tree will be skipped.
 * @param rootItem The root of the sub-tree to traverse, or a leaf node.
 * @return The last item in the sub-tree, or [[rootItem]] if the sub-tree is empty and [[rootItem]]
 *         is actually just a leaf node.
 */
function getLastSubTreeItem(rootItem: ITreeItem): ITreeItem {
  let lastItem = rootItem;
  while (lastItem.expanded && lastItem.hasChildren) {
    const children = lastItem.children;
    lastItem = children[children.length - 1];
  }
  return lastItem;
}

export function register(): typeof TreeViewElement {
  return Polymer<typeof TreeViewElement>(TreeViewElement.prototype);
}
