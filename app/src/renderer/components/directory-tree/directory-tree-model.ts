// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as fs from 'fs-promisified';
import * as path from 'path';
import * as mobx from 'mobx';
import { PanelModel, IPanelItem } from '../layout/panel-model';
import { ContextMenu } from '../../platform/context-menu';
import * as cmds from '../../../common/command-ids';
import { RendererSourceDirRegistry } from '../../source-dir-registry';
import { RendererIPCDispatcher } from '../../ipc-dispatcher';
import { IPC_OPEN_SRC_FILE, IOpenSourceFileRequest } from '../../../common/ipc/source-dir-registry';
import { PROJECT_IPC_KEY } from '../../../common/ipc/keys';

// FIXME: Watch directories in the tree for changes, and update the children of any expanded items
export class DirectoryTreeModel implements IPanelItem {
  id: string;
  /** Array that will contain the result of flattening the current tree into a list. */
  @mobx.observable
  items: DirectoryTreeItemModel[];

  private _root: DirectoryTreeItemModel;
  /** If `true` then exclude the tree root from the generated [[items]] array. */
  private _isRootExcluded: boolean;
  private _indentPerLevel: number;
  private _itemIndices = new Map<DirectoryTreeItemModel, /*index:*/number>();
  private _contextMenu: ContextMenu;
  private _srcDirRegistry: RendererSourceDirRegistry;
  private _disposeDirPathsObserver: mobx.Lambda;
  private _ipcDispatcher: RendererIPCDispatcher;

  constructor({
    id, srcDirRegistry, displayRoot = true, indentPerLevel = 25, ipcDispatcher
  }: DirectoryTreeModel.IConstructorParams) {
    this.id = id;
    this._ipcDispatcher = ipcDispatcher;
    this._isRootExcluded = !displayRoot;
    this._indentPerLevel = indentPerLevel;
    this._root = new DirectoryTreeItemModel({
      id: 'root', fullPath: null, level: 0, isExpandable: true, isExpanded: true
    });
    if (this._isRootExcluded) {
      this.items = [];
    } else {
      this.items = [this._root];
      this._itemIndices.set(this._root, 0);
    }
    this._srcDirRegistry = srcDirRegistry;
    if (mobx.isObservableArray(srcDirRegistry.dirPaths)) {
      this._disposeDirPathsObserver = srcDirRegistry.dirPaths.observe(
        this._onDirsDidChange.bind(this), true
      );
    }
  }

  dispose(): void {
    if (this._contextMenu) {
      this._contextMenu.dispose();
      this._contextMenu = null;
    }
    if (this._disposeDirPathsObserver) {
      this._disposeDirPathsObserver();
      this._disposeDirPathsObserver = null;
    }
  }

  @mobx.action
  private _onDirsDidChange(change: mobx.IArrayChange<string> | mobx.IArraySplice<string>): void {
    if (change.type === 'splice') {
      change.added.forEach(dirPath => this.addDirectory(dirPath));
      change.removed.forEach(dirPath => this.removeDirectory(dirPath));
    }
  }

  async addDirectory(absolutePath: string): Promise<void> {
    // FIXME: Shouldn't be poking around the file system at this point, that should've been done
    // earlier and we should already know if the path is a directory or not.
    const dirStat = await fs.stat(absolutePath);
    if (!dirStat.isDirectory()) {
      throw new Error(`"${absolutePath}" is not a directory.`);
    }
    const item = new DirectoryTreeItemModel({
      id: `${this._root.children ? this._root.children.length : 0}`,
      fullPath: absolutePath, level: 1, parent: this._root, isExpandable: true
    });

    // FIXME: can't just call getLastSubTreeItem() since the order of siblings will depend on the sort order
    this._addItems(getLastSubTreeItem(item.parent), [item]);

    if (this._root.children) {
      this._root.children.push(item);
    } else {
      this._root.children = [];
    }
  }

  removeDirectory(path: string): void {
    // TODO
    /*
    if (item.expanded && item.hasChildren) {
      this._removeItems(item, this._getSubTreeSize(item));
    } else {
      this._removeItems(item, 1);
    }
    */
  }

  async expandItem(item: DirectoryTreeItemModel): Promise<void> {
    if (item.isExpandable && !item.isExpanded) {
      if (!item.children) {
        item.children = await getDirEntries(item);
        item.children.sort(compareDirEntries);
      }
      item.isExpanded = true;

      const flattenedItems: DirectoryTreeItemModel[] = [];
      flattenSubTree(item, flattenedItems);
      this._addItems(item, flattenedItems);
    }
  }

  async collapseItem(item: DirectoryTreeItemModel): Promise<void> {
    if (item.isExpanded) {
      if (item.hasChildren) {
        this._spliceItems(this._itemIndices.get(item) + 1, this._getSubTreeSize(item));
      }
      item.isExpanded = false;
    }
  }

  openFile(item: DirectoryTreeItemModel): void {
    console.log(`Open ${item.path}`);
    this._ipcDispatcher.sendRequest<IOpenSourceFileRequest, void>(
      PROJECT_IPC_KEY, IPC_OPEN_SRC_FILE, { file: item.path }
    );
  }

  computeItemIndent(item: DirectoryTreeItemModel): number {
    return (this._isRootExcluded ? (item.level - 1) : item.level) * this._indentPerLevel;
  }

  extendPanelContextMenu(panelContextMenu: ContextMenu): void {
    if (panelContextMenu.hasItems) {
      panelContextMenu.separator();
    }
    this._extendContextMenu(panelContextMenu);
  }

  showContextMenu(): void {
    if (!this._contextMenu) {
      this._contextMenu = new ContextMenu();
      this._extendContextMenu(this._contextMenu);
    }
    this._contextMenu.show();
  }

  private _extendContextMenu(menu: ContextMenu): void {
    menu.item('Add Directory...', { action: cmds.OPEN_SRC_DIR });
  }

  private _addItems(start: DirectoryTreeItemModel, items: DirectoryTreeItemModel[]): void {
    if (this._isRootExcluded && (start === this._root)) {
      this._spliceItems(0, 0, items);
    } else {
      this._spliceItems(this._itemIndices.get(start) + 1, 0, items);
    }
  }

  private _removeItems(start: DirectoryTreeItemModel, deleteCount: number): void {
    this._spliceItems(this._itemIndices.get(start), deleteCount);
  }

  @mobx.action
  private _spliceItems(startIndex: number, deleteCount: number, newItems?: DirectoryTreeItemModel[]): void {
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
      this.items.splice(startIndex, deleteCount, ...newItems);
    } else {
      this.items.splice(startIndex, deleteCount);
    }
  }

  /**
   * Count how many nodes there are in the given sub-tree (excluding the sub-tree root).
   * Note that only the expanded sections of the sub-tree will be traversed, so any nodes in
   * collapsed sections of the sub-tree will not be counted.
   * @param rootItem The root of the sub-tree to traverse, this item must be in [[this.items]].
   * @return The number of nodes in the sub-tree.
   */
  private _getSubTreeSize(rootItem: DirectoryTreeItemModel): number {
    const lastItem = getLastSubTreeItem(rootItem);
    const indices = this._itemIndices;
    return (rootItem === lastItem) ? 0 : (indices.get(lastItem) - indices.get(rootItem));
  }
}

export namespace DirectoryTreeModel {
  export interface IConstructorParams {
    id: string;
    srcDirRegistry: RendererSourceDirRegistry;
    /** Set to `false` to prevent the root item from being rendered, defaults to `true`. */
    displayRoot?: boolean;
    /** Number of pixels to indent each level of the tree by when the tree is rendered. */
    indentPerLevel?: number;
    ipcDispatcher: RendererIPCDispatcher;
  }
}

/**
 * Find the last item (deepest and rightmost) in the given sub-tree.
 * Note that only the expanded sections of the sub-tree will be traversed, so any nodes in
 * collapsed sections of the sub-tree will be skipped.
 *
 * @param rootItem The root of the sub-tree to traverse, or a leaf node.
 * @return The last item in the sub-tree, or [[rootItem]] if the sub-tree is empty and [[rootItem]]
 *         is actually just a leaf node.
 */
function getLastSubTreeItem(rootItem: DirectoryTreeItemModel): DirectoryTreeItemModel {
  let lastItem = rootItem;
  while (lastItem.isExpanded && lastItem.hasChildren) {
    const children = lastItem.children;
    lastItem = children[children.length - 1];
  }
  return lastItem;
}

function flattenSubTree(
  rootItem: DirectoryTreeItemModel, flattenedItems: DirectoryTreeItemModel[]
): void {
    // traverse the tree in depth-first order (skipping collapsed sub-trees)
    if (rootItem.isExpanded && rootItem.hasChildren) {
      rootItem.children.forEach(item => {
        flattenedItems.push(item);
        flattenSubTree(item, flattenedItems);
      });
    }
  }

async function getDirEntries(dirItem: DirectoryTreeItemModel): Promise<Array<DirectoryTreeItemModel>> {
  let entries = await fs.readdir(dirItem.path);
  entries = entries.map(entry => path.join(dirItem.path, entry));
  const entryStats = await getStats(entries);
  const items: DirectoryTreeItemModel[] = [];
  for (let i = 0; i < entries.length; ++i) {
    if (entries[i] && entryStats[i]) {
      items[i] = new DirectoryTreeItemModel({
        id: `${dirItem.id}.${i}`,
        fullPath: entries[i],
        level: dirItem.level + 1,
        isExpandable: entryStats[i].isDirectory()
      });
    }
  }
  return items;
}

function compareDirEntries(a: DirectoryTreeItemModel, b: DirectoryTreeItemModel): number {
  if (a.isExpandable && !b.isExpandable) {
    return -1;
  }
  if (!a.isExpandable && b.isExpandable) {
    return 1;
  }
  return a.title.localeCompare(b.title);
}

async function getStats(entries: string[]): Promise<Array<fs.Stats>> {
  return Promise.all(entries.map(entry => fs.stat(entry)));
}

export class DirectoryTreeItemModel {
  id: string;
  title: string;
  path: string;
  parent: DirectoryTreeItemModel;
  children: DirectoryTreeItemModel[];
  isExpanded: boolean;
  isExpandable: boolean;
  level: number;

  get hasChildren(): boolean {
    return (this.children && (this.children.length > 0)) ? true : false;
  }

  constructor({
    id, fullPath, level, parent = undefined, isExpandable = false, isExpanded = false
  }: DirectoryTreeItemModel.IConstructorParams) {
    this.title = fullPath ? path.basename(fullPath) : 'root';
    this.path = fullPath;
    this.parent = parent;
    this.isExpandable = isExpandable;
    this.isExpanded = isExpanded;
    this.level = level;
  }
}

export namespace DirectoryTreeItemModel {
  export interface IConstructorParams {
    id: string;
    fullPath: string;
    level: number;
    parent?: DirectoryTreeItemModel;
    isExpandable?: boolean;
    isExpanded?: boolean;
  }
}
