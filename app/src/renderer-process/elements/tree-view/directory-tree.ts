// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as fs from 'fs-promisified';
import * as path from 'path';
import { ITree, ITreeItem } from './tree-view';
import { EventSubscription, EventSubscriptionSet, EventEmitter } from '../../../common/events';

enum EventId {
  DidExpandItem,
  WillCollapseItem,
  DidCollapseItem,
  WillAddItem,
  DidRemoveItem
}

// FIXME: Watch directories in the tree for changes, and update the children of any expanded items
export class DirectoryTree implements ITree {
  root: ITreeItem;

  _emitter: EventEmitter<EventId>;

  constructor() {
    this._emitter = new EventEmitter<EventId>();
    this.root = new DirectoryTreeItem({ fullPath: null, level: 0, expandable: true, expanded: true });
  }

  async addDirectory(absolutePath: string): Promise<void> {
    const dirStat = await fs.stat(absolutePath);
    if (!dirStat.isDirectory()) {
      throw new Error(`"${absolutePath}" is not a directory.`);
    }
    const item = new DirectoryTreeItem({ fullPath: absolutePath, level: 1, parent: this.root, expandable: true });
    this._emitter.emit(EventId.WillAddItem, item);
    if (!this.root.children) {
      this.root.children = [];
    }
    this.root.children.push(item);
  }

  removeDirectory(path: string): void {
    // TODO
    //this._emitter.emit(EventId.DidRemoveItem, item);
  }

  onDidExpandItem(handler: (item: ITreeItem) => void): EventSubscription {
    return this._emitter.on(EventId.DidExpandItem, handler);
  }

  onWillCollapseItem(handler: (item: ITreeItem) => void): EventSubscription {
    return this._emitter.on(EventId.WillCollapseItem, handler);
  }

  onDidCollapseItem(handler: (item: ITreeItem) => void): EventSubscription {
    return this._emitter.on(EventId.DidCollapseItem, handler);
  }

  onWillAddItem(handler: (item: ITreeItem) => void): EventSubscription {
    return this._emitter.on(EventId.WillAddItem, handler);
  }

  onDidRemoveItem(handler: (item: ITreeItem) => void): EventSubscription {
    return this._emitter.on(EventId.DidRemoveItem, handler);
  }

  async expandItem(item: DirectoryTreeItem): Promise<void> {
    if (item.expandable && !item.expanded) {
      if (!item.children) {
        item.children = await getDirEntries(item);
        item.children.sort(compareDirEntries);
      }
      item.expanded = true;
      this._emitter.emit(EventId.DidExpandItem, item);
    }
  }

  async collapseItem(item: DirectoryTreeItem): Promise<void> {
    if (item.expanded) {
      this._emitter.emit(EventId.WillCollapseItem, item);
      item.expanded = false;
      this._emitter.emit(EventId.DidCollapseItem, item);
    }
  }
}

async function getDirEntries(dirItem: DirectoryTreeItem): Promise<Array<DirectoryTreeItem>> {
  let entries = await fs.readdir(dirItem.path);
  entries = entries.map(entry => path.join(dirItem.path, entry));
  const entryStats = await getStats(entries);
  const items: DirectoryTreeItem[] = [];
  for (let i = 0; i < entries.length; ++i) {
    if (entries[i] && entryStats[i]) {
      items[i] = new DirectoryTreeItem({
        fullPath: entries[i],
        level: dirItem.level + 1,
        expandable: entryStats[i].isDirectory()
      });
    }
  }
  return items;
}

function compareDirEntries(a: ITreeItem, b: ITreeItem): number {
  if (a.expandable && !b.expandable) {
    return -1;
  }
  if (!a.expandable && b.expandable) {
    return 1;
  }
  return a.title.localeCompare(b.title);
}

async function getStats(entries: string[]): Promise<Array<fs.Stats>> {
  return Promise.all(entries.map((entry) => fs.stat(entry)));
}

interface IDirectoryTreeItemOptions {
  fullPath: string;
  level: number;
  parent?: ITreeItem;
  expandable?: boolean;
  expanded?: boolean;
}

class DirectoryTreeItem implements ITreeItem {
  title: string;
  path: string;
  parent: ITreeItem;
  children: ITreeItem[];
  expanded: boolean;
  expandable: boolean;
  level: number;

  get hasChildren(): boolean {
    return (this.children && (this.children.length > 0)) ? true : false;
  }

  constructor({
    fullPath, level, parent = undefined, expandable = false, expanded = false
  }: IDirectoryTreeItemOptions) {
    this.title = fullPath ? path.basename(fullPath) : 'root';
    this.path = fullPath;
    this.parent = parent;
    this.expandable = expandable;
    this.expanded = expanded;
    this.level = level;
  }
}
