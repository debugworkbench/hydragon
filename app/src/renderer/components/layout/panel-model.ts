// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Subject, Subscription } from '@reactivex/rxjs';
import { LayoutContainerModel } from './layout-container-model';
import { LayoutItemModel } from './layout-item-model';
import { ContextMenu } from '../../platform/context-menu';

/**
 * Items that are added to a panel must implement this interface.
 */
export interface IPanelItem {
  id: string;
  /** Called after the item is added to a panel. */
  onDidAttachToPanel?(panel: PanelModel): void;
  /**
   * Called before the panel context menu is shown.
   * Panel items can implement this method to add menu items to the panel's context menu.
   */
  extendPanelContextMenu?(panelContextMenu: ContextMenu): void;
}

export class PanelModel extends LayoutItemModel {
  title: string;
  showHeader: boolean;
  items: IPanelItem[] = [];

  private _contextMenu: ContextMenu;

  constructor({
    id, title = undefined, width = undefined, height = undefined, resizable = false,
    showHeader = false
  }: PanelModel.IConstructorParams) {
    super(id);
    this.title = title;
    this.width = width;
    this.height = height;
    this.resizable = resizable;
    this.showHeader = showHeader;
  }

  dispose(): void {
    if (this._contextMenu) {
      this._contextMenu.dispose();
      this._contextMenu = null;
    }
  }

  add(...items: IPanelItem[]): void {
    this.items.push(...items);
    items.forEach(item => {
      if (item.onDidAttachToPanel) {
        item.onDidAttachToPanel(this);
      }
    });
  }

  /** Show the native context menu for this panel. */
  showContextMenu(): void {
    if (this._contextMenu) {
      this._contextMenu.clear();
    } else {
      this._contextMenu = new ContextMenu();
    }
    this.items.forEach(item => {
      if (item.extendPanelContextMenu) {
        item.extendPanelContextMenu(this._contextMenu);
      }
    });
    if (this._contextMenu.hasItems) {
      this._contextMenu.show();
    }
  }
}

export namespace PanelModel {
  export interface IConstructorParams {
    id: string;
    title?: string;
    width?: string;
    height?: string;
    resizable?: boolean;
    showHeader?: boolean;
  }
}
