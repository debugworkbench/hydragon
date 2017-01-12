// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

export const enum WidgetKind {
  Window = 0,
  LayoutContainer,
  Panel,
  Button,
  Dropdown,
  DropdownItem,
  Toolbar
}

export type WidgetPath = Array<string | number>;

export interface IWidget {
  readonly kind: WidgetKind;
  readonly id: string;
  /** Path to this widget from the root of the generic UI/widget tree. */
  readonly path: WidgetPath;
}

export interface IWindow extends IWidget {
  layout: ILayoutContainer;
}

export interface ILayoutContainer extends IWidget {
  readonly direction: 'vertical' | 'horizontal';
  width?: string;
  height?: string;
  resizable?: boolean;
  items: Array<IPanel | ILayoutContainer>;
}

export interface IPanel extends IWidget {
  title?: string;
  width?: string;
  height?: string;
  resizable?: boolean;
  showHeader?: boolean;
  items: any[];
}

export interface IButton extends IWidget {
  width?: string;
  height?: string;
  icon?: string;
  description?: string;
  enabled?: boolean;
}

export interface IDropdownItem extends IWidget {
  label: string;
}

export interface IDropdown extends IWidget {
  readonly label: string;
  readonly items: IDropdownItem[];
  readonly selectionIndex: number | null;
}

export interface IToolbar extends IWidget {
  items: IWidget[];
}

export const enum WidgetEventKind {
  DidSelectDropdownItem = 0
}

export interface IDidSelectDropdownItemEvent {
  kind: WidgetEventKind.DidSelectDropdownItem;
  /**
   * Widget path to the item that was selected, the last element in this list corresponds to the
   * index of the item that was selected.
   */
  path: WidgetPath;
  /** Index of the item that was selected. */
  itemIndex: number;
  /** Identifier of the item that was selected. */
  itemId?: string;
}

export type WidgetEvent = IDidSelectDropdownItemEvent;
