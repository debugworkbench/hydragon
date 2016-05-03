// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-menu custom element.
 */
@themable
export class PaperMenuComponent
       extends PolymerComponent<
                 PolymerElements.PaperMenu,
                 PaperMenuComponent.IProps,
                 PaperMenuComponent.IContext> {

  protected get cssVars() {
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-menu-background-color': styles.backgroundColor || theme.primaryBackgroundColor,
      '--paper-menu-color': styles.textColor || theme.primaryTextColor
    };
  }

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
    styles?: {
      backgroundColor?: string;
      textColor?: string;
    };
  }

  export interface IContext extends themable.IContext {
  }
}
