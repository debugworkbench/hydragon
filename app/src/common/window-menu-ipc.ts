// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

// IPC channels used by WindowMenu and WindowMenuManager

/**
 * [[WindowMenu]] will use this channel to send an [[IResetMenuRequest]] to [[WindowMenuManager]],
 * which will then build a new menu from the template contained in the request and replace the
 * previous window menu (if any) with the new one.
 */
export const IPC_RESET_MENU = 'window-menu:reset';
/**
 * [[WindowMenu]] will use this channel to send an [[IUpdateRequest]] to [[WindowMenuManager]],
 * which will then update the corresponding menu item as requested.
 */
export const IPC_UPDATE = 'window-menu:update';
/**
 * [[WindowMenuManager]] will use this channel to send an [[IActionRequest]] to [[WindowMenu]],
 * which will in turn execute the action associated with the menu item identified in the request.
 */
export const IPC_ACTION = 'window-menu:item-action';

export interface ISerializedItem {
  id: string;
  type?: GitHubElectron.MenuItemType;
  label?: string;
  role?: GitHubElectron.MenuItemRole;
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  submenu?: ISerializedItem[];
}

/** Sent by [[WindowMenu]] to [[WindowMenuManager]]. */
export interface IResetMenuRequest {
  items: ISerializedItem[];
}

/** Sent by [[WindowMenu]] to [[WindowMenuManager]]. */
export interface IUpdateRequest {
  /** Menu item identifier. */
  id: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
}

/** Sent by [[WindowMenuManager]] to [[WindowMenu]]. */
export interface IActionRequest {
  id: string;
  checked?: boolean;
}
