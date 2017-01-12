// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { ContextComponent } from './context';
import { PaperDropdownMenuComponent, PaperMenuComponent } from './paper';
import { DropdownModel } from './dropdown-model';

export interface IDropdownProps {
  model: DropdownModel;
}

@mobxReact.observer
export class DropdownComponent extends ContextComponent<IDropdownProps, {}, {}> {
  private _dropdownRef: PaperDropdownMenuComponent;
  private _menuRef: PaperMenuComponent;

  private _onSetDropdownRef = (ref: PaperDropdownMenuComponent) => this._dropdownRef = ref;
  private _onSetMenuRef = (ref: PaperMenuComponent) => this._menuRef = ref;

  private _onDidSelectItem = (e: PolymerElements.IronSelectEvent): void => {
    const itemIndex = this._menuRef.indexOf(e.detail.item as PolymerElements.PaperItem);
    this.props.model.onDidSelectItem(itemIndex);
  }

  render(): JSX.Element {
    const model = this.props.model;
    const items = model.items
      ? model.items.map(item => (<paper-item key={item.label}>{item.label}</paper-item>))
      : null;

    return (
      <PaperDropdownMenuComponent
        ref={this._onSetDropdownRef}
        label={model.label}
        no-label-float
        onDidSelectItem={this._onDidSelectItem}>
        <PaperMenuComponent
          className="dropdown-content"
          ref={this._onSetMenuRef}
          selected={model.selectedItemIndex}>
          { items }
        </PaperMenuComponent>
      </PaperDropdownMenuComponent>
    );
  }
}
