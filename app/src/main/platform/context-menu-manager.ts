// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow, Menu } from 'electron';
import { CommandTable } from '../../common/command-table';
import * as ipc from '../../common/ipc/context-menu';

/**
 * Works in conjuction with [[ContextMenu]] to allow context menus to be created and shown from
 * a renderer process.
 */
export class ContextMenuManager {
  constructor(private commands: CommandTable) {
    ipcMain.on(ipc.IPC_SHOW_MENU, this._onShowMenu);
  }

  dispose(): void {
    ipcMain.removeListener(ipc.IPC_SHOW_MENU, this._onShowMenu);
  }

  private _setClickCallback(items: GitHubElectron.MenuItemOptions[]): void {
    items.forEach(item => {
      if (item.type === 'normal') {
        item.click = this._onDidClick;
      } else if (item.type === 'checkbox') {
        item.click = this._onDidClickCheckbox;
      } else if (item.submenu && !(item.submenu instanceof Menu)) {
        this._setClickCallback(item.submenu);
      }
    });
  }

  private _onDidClick = (
    menuItem: GitHubElectron.MenuItem, browserWindow: GitHubElectron.BrowserWindow
  ): void => {
    const cmdId = (<ipc.ISerializedMenuItem & GitHubElectron.MenuItem> menuItem).command;
    if (cmdId) {
      const cmd = this.commands.findCommandById(cmdId);
      if (cmd) {
        cmd.execute({ browserWindow });
      }
    } else {
      const request: ipc.IActionRequest = { id: menuItem.id };
      browserWindow.webContents.send(ipc.IPC_ACTION, request);
    }
  }

  private _onDidClickCheckbox = (
    menuItem: GitHubElectron.MenuItem, browserWindow: GitHubElectron.BrowserWindow
  ): void => {
    const cmdId = (<ipc.ISerializedMenuItem & GitHubElectron.MenuItem> menuItem).command;
    if (cmdId) {
      const cmd = this.commands.findCommandById(cmdId);
      if (cmd) {
        cmd.execute({ value: menuItem.checked, browserWindow });
      }
    } else {
      const request: ipc.IActionRequest = {
        id: menuItem.id, checked: menuItem.checked
      };
      browserWindow.webContents.send(ipc.IPC_ACTION, request);
    }
  }

  private _onShowMenu = (
    event: GitHubElectron.IMainIPCEvent, request: ipc.IShowMenuRequest
  ): void => {
    this._setClickCallback(request.items);
    const menu = Menu.buildFromTemplate(request.items);
    menu.popup(BrowserWindow.fromWebContents(event.sender));
  }
}
