// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// IPC channels used by ContextMenu and ContextMenuManager

/**
 * [[ContextMenuManager]] will use this channel to send an [[IActionRequest]] to [[ContextMenu]],
 * which will in turn execute the action associated with the menu item identified in the request.
 */
export const IPC_ACTION = 'context-menu:item-action';
/**
 * [[ContextMenu]] will use this channel to send an [[IShowMenuRequest]] to [[ContextMenuManager]],
 * which will then build and show a new menu from the template contained in the request.
 */
export const IPC_SHOW_MENU = 'context-menu:show';

export interface ISerializedMenuItem {
  id: string;
  type?: GitHubElectron.MenuItemType;
  label?: string;
  role?: GitHubElectron.MenuItemRole;
  command?: string;
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  submenu?: ISerializedMenuItem[];
}

/** Sent by [[ContextMenu]] to [[ContextMenuManager]]. */
export interface IShowMenuRequest {
  items: ISerializedMenuItem[];
}

/** Sent by [[ContextMenuManager]] to [[ContextMenu]]. */
export interface IActionRequest {
  id: string;
  checked?: boolean;
}
