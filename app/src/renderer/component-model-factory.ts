// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import {
  WidgetKind, IWidget, IWindow, ILayoutContainer, IPanel, IToolbar, IDropdown, IButton
} from '../display-server';
import {
  ComponentModel, WindowModel, LayoutContainerModel, PanelModel, ToolbarModel, DropdownModel,
  ButtonModel
} from './components/models';

/**
 * Creates component models from generic widget descriptions.
 */
export class ComponentModelFactory {
  private _modelConstructors: Map<WidgetKind, (json: any) => any>;

  constructor(private _emitEvent: (event: any) => void) {
    this._modelConstructors = new Map<WidgetKind, (json: any) => any>([
      [WidgetKind.Window, this._createWindow],
      [WidgetKind.LayoutContainer, this._createLayoutContainer],
      [WidgetKind.Panel, this._createPanel],
      [WidgetKind.Toolbar, this._createToolbar],
      [WidgetKind.Dropdown, this._createDropdown],
      [WidgetKind.Button, this._createButton]
    ]);
  }

  createModel = (widget: IWidget): ComponentModel => {
    const create = this._modelConstructors.get(widget.kind);
    return create ? create(widget) : mobx.observable(widget);
  }

  private _createWindow = (widget: IWindow): WindowModel => {
    const layout = this._createLayoutContainer(widget.layout);
    return new WindowModel({ ...widget, widgetPath: widget.path, layout });
  }

  private _createLayoutContainer = (widget: ILayoutContainer): LayoutContainerModel => {
    const items = widget.items ? widget.items.map(this.createModel) : [];
    return new LayoutContainerModel({ ...widget, widgetPath: widget.path, items });
  }

  private _createPanel = (widget: IPanel): PanelModel => {
    const items = widget.items ? widget.items.map(this.createModel) : [];
    return new PanelModel({ ...widget, widgetPath: widget.path, items });
  }

  private _createToolbar = (widget: IToolbar): ToolbarModel => {
    const items = widget.items ? widget.items.map(this.createModel) : [];
    return new ToolbarModel({ ...widget, widgetPath: widget.path, items });
  }

  private _createDropdown = (widget: IDropdown): DropdownModel => {
    const items = widget.items ? widget.items.map(this.createModel) : [];
    return new DropdownModel({
      ...widget, widgetPath: widget.path, items, emitEvent: this._emitEvent
    });
  }

  private _createButton = (widget: IButton): ButtonModel => {
    return new ButtonModel({ ...widget, widgetPath: widget.path });
  }
}
