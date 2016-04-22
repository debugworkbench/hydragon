// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { LayoutContainerModel } from './layout-container';
import { LayoutItemModel } from './layout-item';

/**
 * Items that are added to a panel must implement this interface.
 */
export interface IPanelItem {
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
  children: IPanelItem[];

  constructor({ id, title = undefined, width = undefined, height = undefined, resizable = false, showHeader = false }: IPanelParams) {
    super(id);
    this.children = [];
    this.width = width;
    this.height = height;
    this.resizable = resizable;
  }

  add(...children: IPanelItem[]): void {
    this.children.push(...children);
    children.forEach(child => child.onDidAttachToPanel(this));
  }
}