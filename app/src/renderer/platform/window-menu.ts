// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// TODO: When a WindowMenu.Item label or any other property other than visible/enabled/checked
//       changes then need to send an IPC message to [[WindowMenuManager]] with the new state and
//       it must recreate the entire menu.
// TODO: It should be possible to add new items and replace existing ones.

import { ipcRenderer } from 'electron';
import * as mobx from 'mobx';
import * as ipc from '../../common/window-menu-ipc';

/**
 * Creates and manipulates the window menu.
 *
 * The Electron menu API is only directly accessible in the main process so [[WindowMenu]]
 * manipulates the menu indirectly via [[WindowMenuManager]] (that lives in main process).
 */
export class WindowMenu {
  private items: WindowMenu.ItemType[] = [];
  private nextItemId = 1;
  private isUpdatePending = false;
  private isAutoSyncEnabled: boolean;

  constructor() {
    this.isAutoSyncEnabled = false;
    ipcRenderer.on(ipc.IPC_ACTION, this.onActionRequest);
  }

  private onActionRequest = (
    event: GitHubElectron.IRendererIPCEvent, request: ipc.IActionRequest
  ) => {
    // each item id contains the ids of all its ancestors, so given an item id the item itself
    // can be located by following the ids down the menu hierarchy
    const ids = request.id.split('.');
    let items = this.items;
    let item: WindowMenu.ItemType;
    for (let i = 0; i < ids.length; ++i) {
      const itemId = ids.slice(0, i + 1).join('.');
      const matchingItems = items.filter(item => item.id === itemId);
      if (matchingItems.length === 1) {
        item = matchingItems[0];
      } else {
        throw new Error(`ID ${request.id} doesn't match any menu item!`);
      }
      if (item instanceof WindowMenu.SubMenu) {
        items = item.items;
      } else if (i !== (ids.length - 1)) {
        throw new Error(`ID ${request.id} doesn't match any menu item!`);
      }
    }
    if ((item instanceof WindowMenu.CheckedItem) && (request.checked !== undefined)) {
      item.isChecked = request.checked;
      item.activate();
    } else if (item instanceof WindowMenu.Item) {
      item.activate();
    }
  };

  /**
   * Create a regular menu item and append it to the end of the menu.
   */
  item(label: string, options?: WindowMenu.Item.IOptions): WindowMenu.Item {
    const item = new WindowMenu.Item(`${this.nextItemId++}`, label, options);
    this.append(item);
    return item;
  }

  /**
   * Create a submenu and append it to the end of the menu.
   */
  subMenu(label: string, options?: WindowMenu.SubMenu.IOptions): WindowMenu.SubMenu {
    const subMenu = new WindowMenu.SubMenu(`${this.nextItemId++}`, label, options);
    this.append(subMenu);
    return subMenu;
  }

  private append(item: WindowMenu.ItemType): void {
    this.items.push(item);
  }

  /**
   * Send a request to [[WindowMenuManager]] to update a menu item.
   */
  private updateItem = (item: ipc.ISerializedItem): void => {
    if (!this.isAutoSyncEnabled) {
      return;
    }
    window.requestAnimationFrame(() => {
      const request: ipc.IUpdateRequest = {
        id: item.id,
        enabled: item.enabled,
        visible: item.visible,
        checked: item.checked
      };
      ipcRenderer.send(ipc.IPC_UPDATE, request);
    });
  }

  /**
   * Send a request to [[WindowMenuManager]] to recreate the entire menu.
   */
  resync(): void {
    if (this.isUpdatePending) {
      return;
    }
    this.isUpdatePending = true;
    window.requestAnimationFrame(() => {
      const request: ipc.IResetMenuRequest = {
        items: this.items.map(item => item.serialize())
      };
      ipcRenderer.send(ipc.IPC_RESET_MENU, request);
      this.items.forEach(item => item.autoSync(this.updateItem));
      this.isUpdatePending = false;
      this.isAutoSyncEnabled = true;
    });
  }
}

export namespace WindowMenu {
  export type ItemType = Item | Separator | CheckedItem | SubMenu;

  /**
   * Base class for all menu items.
   *
   * Changes to any observable properties will be automatically propagated to [[WindowMenuManager]].
   */
  abstract class AbstractItem {
    @mobx.observable
    isEnabled: boolean | mobx.IObservableValue<boolean>;
    @mobx.observable
    isVisible: boolean | mobx.IObservableValue<boolean>;

    private disposeAutoSync: mobx.Lambda;

    /**
     * @param id Unique identifier for the menu item, it must contain all the ids of its ancestors
     *           seperated by dots.
     */
    constructor(public id: string, options?: AbstractItem.IOptions) {
      if (options) {
        this.isEnabled = (options.isEnabled !== undefined) ? options.isEnabled : true;
        this.isVisible = (options.isVisible !== undefined) ? options.isVisible : true;
      } else {
        this.isEnabled = true;
        this.isVisible = true;
      }
    }

    /**
     * Start watching for changes to the menu item and propagate them to [[WindowMenuManager]].
     */
    autoSync(syncCallback: (item: ipc.ISerializedItem) => void): void {
      if (this.disposeAutoSync) {
        this.disposeAutoSync();
      }
      let isFirstRun = true;
      this.disposeAutoSync = mobx.autorun(() => {
        // serialize() will access all the observable properties so that autorun will know what it
        // needs to observe from that point on
        const item = this.serialize({ deep: false });
        // on the first run there should be no changes to propagate (since autoSync should be
        // invoked right after the menu item is created)
        if (!isFirstRun) {
          syncCallback(item);
        }
        isFirstRun = false;
      });
    }

    dispose(): void {
      this.disposeAutoSync();
    }

    /**
     * Serialize the item into a form that can be sent via Electron IPC.
     *
     * @param options.deep By default submenu items will be recursively serialized, to prevent that
     *                     set this option to `false`.
     * @return Plain object containing the serialized properties of the menu item.
     */
    serialize(options?: { deep?: boolean }): ipc.ISerializedItem {
      return {
        id: this.id,
        enabled: (typeof this.isEnabled === 'boolean') ? this.isEnabled : this.isEnabled.get(),
        visible: (typeof this.isVisible === 'boolean') ? this.isVisible : this.isVisible.get()
      };
    }
  }

  export namespace AbstractItem {
    export interface IOptions {
      isEnabled?: boolean | mobx.IObservableValue<boolean>;
      isVisible?: boolean | mobx.IObservableValue<boolean>;
    }
  }

  /**
   * Menu item that performs an action when activated.
   *
   * Menu items can be activated by being clicked or with a keyboard shortcut.
   */
  export class Item extends AbstractItem {
    action: (item: Item) => void;

    constructor(id: string, public label: string, options?: Item.IOptions) {
      super(id, options);
      if (options) {
        this.action = options.action;
      }
    }

    /**
     * Perform the action associated with this menu item.
     */
    activate(): void {
      if (this.action) {
        this.action(this);
      }
    }

    serialize(options?: { deep?: boolean }): ipc.ISerializedItem {
      const obj = super.serialize();
      obj.label = this.label;
      obj.type = 'normal';
      return obj;
    }
  }

  export namespace Item {
    export interface IOptions extends AbstractItem.IOptions {
      action?: (item: Item) => void;
    }
  }

  /**
   * Separator menu item.
   */
  export class Separator extends AbstractItem {
    serialize(options?: { deep?: boolean }): ipc.ISerializedItem {
      const obj = super.serialize();
      obj.type = 'separator';
      return obj;
    }
  }

  export namespace Separator {
    export type IOptions = AbstractItem.IOptions;
  }

  /**
   * Menu item that can be checked/unchecked.
   */
  export class CheckedItem extends Item {
    @mobx.observable
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

    serialize(options?: { deep?: boolean }): ipc.ISerializedItem {
      const obj = super.serialize();
      obj.type = 'checkbox';
      obj.checked = (typeof this.isChecked === 'boolean') ? this.isChecked : this.isChecked.get();
      console.log(`checkbox ${obj.label} checked = ${obj.checked}`);
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
    item(label: string, options?: Item.IOptions): WindowMenu.Item {
      const item = new WindowMenu.Item(`${this.id}.${this.nextItemId++}`, label, options);
      this.append(item);
      return item;
    }

    /**
     * Create a separator menu item and append it to the end of the submenu.
     */
    separator(options?: Separator.IOptions): WindowMenu.Separator {
      const separator =  new WindowMenu.Separator(`${this.id}.${this.nextItemId++}`, options);
      this.append(separator);
      return separator;
    }

    /**
     * Create a checkbox menu item and append it to the end of the submenu.
     */
    checkedItem(label: string, options?: CheckedItem.IOptions): WindowMenu.CheckedItem {
      const item = new WindowMenu.CheckedItem(`${this.id}.${this.nextItemId++}`, label, options);
      this.append(item);
      return item;
    }

    /**
     * Create a submenu and append it to the end of the submenu.
     */
    subMenu(label: string, options?: SubMenu.IOptions): WindowMenu.SubMenu {
      const subMenu = new WindowMenu.SubMenu(`${this.id}.${this.nextItemId++}`, label, options);
      this.append(subMenu);
      return subMenu;
    }

    private append(item: WindowMenu.ItemType): void {
      this.items.push(item);
    }

    autoSync(syncCallback: (item: ipc.ISerializedItem) => void): void {
      super.autoSync(syncCallback);
      this.items.forEach(item => item.autoSync(syncCallback));
    }

    serialize(options?: { deep?: boolean }): ipc.ISerializedItem {
      const obj = super.serialize();
      obj.type = 'submenu';
      if (!options || (options.deep !== false)) {
        obj.submenu = this.items.map(item => item.serialize(options));
      }
      return obj;
    }
  }

  export namespace SubMenu {
    export type IOptions = Item.IOptions;
  }
}
