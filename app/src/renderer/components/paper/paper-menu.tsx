// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';

/**
 * React component that wraps a Polymer paper-menu custom element.
 */
export class PaperMenuComponent
       extends PolymerComponent<PolymerElements.PaperMenu, PaperMenuComponent.IProps, {}> {

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperMenuComponent.IProps) {
    return (
      <paper-menu {...props}></paper-menu>
    );
  }
}

namespace PaperMenuComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Sets the selected element, by default the value should be the index of a menu item. */
    selected?: string | number;
  }
}
