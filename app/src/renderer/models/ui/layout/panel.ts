// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { LayoutContainerModel } from './layout-container';
import { LayoutItemModel } from './layout-item';

/**
 * Items that are added to a panel must implement this interface.
 */
export interface IPanelItem {
  id: string;
  /** Called after the item is added to a panel. */
  onDidAttachToPanel(panel: PanelModel): void;
}

export interface IPanelParams {
  id: string;
  title?: string;
  width?: string;
  height?: string;
  resizable?: boolean;
  showHeader?: boolean;
}

export class PanelModel extends LayoutItemModel {
  title: string;
  showHeader: boolean;
  items: IPanelItem[];

  constructor({
    id, title = undefined, width = undefined, height = undefined, resizable = false,
    showHeader = false
  }: IPanelParams) {
    super(id);
    this.items = [];
    this.width = width;
    this.height = height;
    this.resizable = resizable;
  }

  add(...items: IPanelItem[]): void {
    this.items.push(...items);
    items.forEach(item => item.onDidAttachToPanel(this));
  }
}
