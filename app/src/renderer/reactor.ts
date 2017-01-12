// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import {
  ComponentModel, LayoutContainerModel, PanelModel, SplitterModel, ToolbarModel, ButtonModel,
  DropdownModel
} from './components/models';
import {
  LayoutContainerComponent, PanelComponent, SplitterComponent, ToolbarComponent, DropdownComponent,
  ButtonComponent
} from './components';

export type ConstructorType<T extends ComponentModel> = { new(...args: any[]): T };

/**
 * Creates React elements for observable models.
 */
export class Reactor {
  private _components = new Map<ConstructorType<any>, React.ComponentClass<any>>([
    [LayoutContainerModel, LayoutContainerComponent],
    [PanelModel, PanelComponent],
    [SplitterModel, SplitterComponent],
    [ToolbarModel, ToolbarComponent],
    [ButtonModel, ButtonComponent],
    [DropdownModel, DropdownComponent]
  ]);

  createReactElement(model: any, props?: any): React.ReactElement<any> {
    if ((model === null) || (model === undefined)) {
      return null;
    }
    let componentClass = this._components.get(model.constructor);
    return React.createElement(componentClass, { ...props, model });
  }
}
