// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow, Menu } from 'electron';
import * as ipc from '../../common/window-menu-ipc';

/**
 * Works in conjuction with [[WindowMenu]] to allow the `BrowserWindow` menu to be manipulated
 * from a renderer process.
 */
export class WindowMenuManager {
  menu: GitHubElectron.Menu;

  constructor() {
    ipcMain.on(ipc.IPC_RESET_MENU, this.onResetMenuRequest);
    ipcMain.on(ipc.IPC_UPDATE, this.onUpdateRequest);
  }

  dispose(): void {
    ipcMain.removeListener(ipc.IPC_RESET_MENU, this.onResetMenuRequest);
    ipcMain.removeListener(ipc.IPC_UPDATE, this.onUpdateRequest);
  }

  private onResetMenuRequest = (
    event: GitHubElectron.IMainIPCEvent, request: ipc.IResetMenuRequest
  ) => {
    this.resetMenu(BrowserWindow.fromWebContents(event.sender), request.items);
  };

  private onUpdateRequest = (
    event: GitHubElectron.IMainIPCEvent, request: ipc.IUpdateRequest
  ) => {
    // each item id contains the ids of all its ancestors, so given an item id the item itself
    // can be located by following the ids down the menu hierarchy
    const ids = request.id.split('.');
    let items = this.menu.items;
    let item: GitHubElectron.MenuItem;
    for (let i = 0; i < ids.length; ++i) {
      const itemId = ids.slice(0, i + 1).join('.');
      const matchingItems = items.filter(item => item.id === itemId);
      if (matchingItems.length === 1) {
        item = matchingItems[0];
      } else {
        throw new Error(`ID ${request.id} doesn't match any existing menu item!`);
      }
      if (item.submenu) {
        items = item.submenu.items;
      } else if (i !== (ids.length - 1)) {
        throw new Error(`ID ${request.id} doesn't match any existing menu item!`);
      }
    }
    if (item) {
      if (request.enabled !== undefined) {
        item.enabled = request.enabled;
      }
      if (request.visible !== undefined) {
        item.visible = request.visible;
      }
      if (request.checked !== undefined) {
        item.checked = request.checked;
      }
    }
  };

  private resetMenu(
    browserWindow: GitHubElectron.BrowserWindow, items: GitHubElectron.MenuItemOptions[]
  ): void {
    this.setClickCallback(items);
    this.menu = Menu.buildFromTemplate(items);
    // FIXME: on OS X have to use windowMenu.setApplicationMenu() instead
    browserWindow.setMenu(this.menu);
  }

  private setClickCallback(items: GitHubElectron.MenuItemOptions[]): void {
    items.forEach(item => {
      if (item.type === 'normal') {
        item.click = onDidClick;
      } else if (item.type === 'checkbox') {
        item.click = onDidClickCheckbox;
      } else if (item.submenu && !(item.submenu instanceof Menu)) {
        this.setClickCallback(item.submenu);
      }
    });
  }
}

function onDidClick(
  menuItem: GitHubElectron.MenuItem, browserWindow: GitHubElectron.BrowserWindow
): void {
  const request: ipc.IActionRequest = { id: menuItem.id };
  browserWindow.webContents.send(ipc.IPC_ACTION, request);
}

function onDidClickCheckbox(
  menuItem: GitHubElectron.MenuItem, browserWindow: GitHubElectron.BrowserWindow
): void {
  const request: ipc.IActionRequest = {
    id: menuItem.id, checked: menuItem.checked
  };
  browserWindow.webContents.send(ipc.IPC_ACTION, request);
}
