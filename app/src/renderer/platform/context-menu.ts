// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as mobx from 'mobx';
import * as ipc from '../../common/ipc/context-menu';

/**
 * Creates and shows a native context menu.
 *
 * The Electron menu API is only directly accessible in the main process so [[ContextMenu]]
 * creates the menu indirectly via [[ContextMenuManager]] (that lives in main process).
 */
export class ContextMenu {
  private _items: ContextMenu.ItemType[] = [];
  private _nextItemId = 1;

  constructor() {
    this._onActionRequest = this._onActionRequest.bind(this);
  }

  /**
   * Should be called once the menu is no longer needed to cleanup event listeners.
   */
  dispose(): void {
    ipcRenderer.removeListener(ipc.IPC_ACTION, this._onActionRequest);
  }

  get hasItems(): boolean {
    return this._items.length > 0;
  }

  /** Remove all items from the menu. */
  clear(): void {
    this._items = [];
  }

  private _onActionRequest(
    event: GitHubElectron.IRendererIPCEvent, request: ipc.IActionRequest
  ): void {
    // each item id contains the ids of all its ancestors, so given an item id the item itself
    // can be located by following the ids down the menu hierarchy
    const ids = request.id.split('.');
    let items = this._items;
    let item: ContextMenu.ItemType;
    for (let i = 0; i < ids.length; ++i) {
      const itemId = ids.slice(0, i + 1).join('.');
      const matchingItems = items.filter(item => item.id === itemId);
      if (matchingItems.length === 1) {
        item = matchingItems[0];
      } else {
        throw new Error(`ID ${request.id} doesn't match any menu item!`);
      }
      if (item instanceof ContextMenu.SubMenu) {
        items = item.items;
      } else if (i !== (ids.length - 1)) {
        throw new Error(`ID ${request.id} doesn't match any menu item!`);
      }
    }
    if ((item instanceof ContextMenu.CheckedItem) && (request.checked !== undefined)) {
      item.isChecked = request.checked;
      item.activate();
    } else if (item instanceof ContextMenu.Item) {
      item.activate();
    }
  };

  /**
   * Create a regular menu item and append it to the end of the menu.
   */
  item(label: string, options?: ContextMenu.Item.IOptions): ContextMenu.Item {
    const item = new ContextMenu.Item(`${this._nextItemId++}`, label, options);
    this._items.push(item);
    return item;
  }

  /**
   * Create a separator menu item and append it to the end of the menu.
   */
  separator(): ContextMenu.Separator {
    const separator =  new ContextMenu.Separator(`${this._nextItemId++}`);
    this._items.push(separator);
    return separator;
  }

  /**
   * Create a checkbox menu item and append it to the end of the menu.
   */
  checkedItem(label: string, options?: ContextMenu.CheckedItem.IOptions): ContextMenu.CheckedItem {
    const item = new ContextMenu.CheckedItem(`${this._nextItemId}`, label, options);
    this._items.push(item);
    return item;
  }

  /**
   * Create a submenu and append it to the end of the menu.
   */
  subMenu(label: string, options?: ContextMenu.SubMenu.IOptions): ContextMenu.SubMenu {
    const subMenu = new ContextMenu.SubMenu(`${this._nextItemId++}`, label, options);
    this._items.push(subMenu);
    return subMenu;
  }

  show(): void {
    const request: ipc.IShowMenuRequest = {
      items: this._items.map(item => item.serialize())
    };
    // the last context menu that was shown would've only removed its IPC_ACTION listener if the
    // user activated a menu item that had a callback in the renderer process, in all other cases
    // that listener will still be around at this point and must be removed before the new one is
    // installed
    ipcRenderer.removeAllListeners(ipc.IPC_ACTION);
    ipcRenderer.once(ipc.IPC_ACTION, this._onActionRequest);
    ipcRenderer.send(ipc.IPC_SHOW_MENU, request);
  }
}

export namespace ContextMenu {
  export type ItemType = Item | Separator | CheckedItem | SubMenu;

  /**
   * Menu item that performs an action when activated.
   *
   * Menu items can be activated by being clicked.
   */
  export class Item {
    /**
     * If set then the menu item will act in the standard OS-specific manner and the action property
     * will be ignored.
     *
     * On OS X if this property is set then the label is the only other property that will apply,
     * all other properties will be ignored.
     */
    role: GitHubElectron.MenuItemRole;
    /**
     * Action to perform when the menu item is activated.
     * This can be a callback function or an identifier of a command that's registered in the main
     * process. In the latter case the corresponding command will be executed in the main process
     * when the menu item is activated.
     */
    action: Item.IActionCallback | string;

    constructor(public id: string, public label: string, options?: Item.IOptions) {
      if (options) {
        this.role = options.role;
        this.action = options.action;
      }
    }

    /**
     * Perform the action associated with this menu item.
     */
    activate(): void {
      if (typeof this.action === 'function') {
        this.action(this);
      }
    }

    serialize(): ipc.ISerializedMenuItem {
      return {
        id: this.id,
        label: this.label,
        type: 'normal',
        role: this.role,
        command: (typeof this.action === 'string') ? this.action : undefined
      };
    }
  }

  export namespace Item {
    export type IActionCallback = (item: Item) => void;
    export interface IOptions {
      role?: GitHubElectron.MenuItemRole;
      action?: IActionCallback | string;
    }
  }

  /**
   * Separator menu item.
   */
  export class Separator {
    constructor(public id: string) {
      // noop
    }

    serialize(): ipc.ISerializedMenuItem {
      return {
        id: this.id,
        type: 'separator'
      };
    }
  }

  /**
   * Menu item that can be checked/unchecked.
   */
  export class CheckedItem extends Item {
    isChecked: boolean | mobx.IObservableValue<boolean>;

    constructor(
      id: string, label: string, options?: CheckedItem.IOptions
    ) {
      super(id, label, options);
      if (options) {
        this.isChecked = (options.isChecked !== undefined) ? options.isChecked : false;
      } else {
        this.isChecked = false;
      }
    }

    serialize(): ipc.ISerializedMenuItem {
      const obj = super.serialize();
      obj.type = 'checkbox';
      obj.checked = (typeof this.isChecked === 'boolean') ? this.isChecked : this.isChecked.get();
      return obj;
    }
  }

  export namespace CheckedItem {
    export interface IOptions extends Item.IOptions {
      isChecked?: boolean | mobx.IObservableValue<boolean>;
      action?: (item: CheckedItem) => void;
    }
  }

  /**
   * Menu item that contains other menu items.
   */
  export class SubMenu extends Item {
    private nextItemId = 1;

    items: ItemType[] = [];

    /**
     * Create a regular menu item and append it to the end of the submenu.
     */
    item(label: string, options?: Item.IOptions): ContextMenu.Item {
      const item = new ContextMenu.Item(`${this.id}.${this.nextItemId++}`, label, options);
      this.items.push(item);
      return item;
    }

    /**
     * Create a separator menu item and append it to the end of the submenu.
     */
    separator(): ContextMenu.Separator {
      const separator =  new ContextMenu.Separator(`${this.id}.${this.nextItemId++}`);
      this.items.push(separator);
      return separator;
    }

    /**
     * Create a checkbox menu item and append it to the end of the submenu.
     */
    checkedItem(label: string, options?: CheckedItem.IOptions): ContextMenu.CheckedItem {
      const item = new ContextMenu.CheckedItem(`${this.id}.${this.nextItemId++}`, label, options);
      this.items.push(item);
      return item;
    }

    /**
     * Create a submenu and append it to the end of the submenu.
     */
    subMenu(label: string, options?: SubMenu.IOptions): ContextMenu.SubMenu {
      const subMenu = new ContextMenu.SubMenu(`${this.id}.${this.nextItemId++}`, label, options);
      this.items.push(subMenu);
      return subMenu;
    }

    serialize(): ipc.ISerializedMenuItem {
      const obj = super.serialize();
      obj.type = 'submenu';
      obj.submenu = this.items.map(item => item.serialize());
      return obj;
    }
  }

  export namespace SubMenu {
    export type IOptions = Item.IOptions;
  }
}

