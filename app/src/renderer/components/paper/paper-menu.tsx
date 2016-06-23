// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-menu custom element.
 */
export class PaperMenuComponent
       extends PolymerComponent<PolymerElements.PaperMenu, PaperMenuComponent.IProps, {}> {

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.backgroundColor) {
        vars['--paper-menu-background-color'] = styles.backgroundColor;
      }
      if (styles.textColor) {
        vars['--paper-menu-color'] = styles.textColor;
      }
    }
    return vars;
  }

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperMenuComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-menu {...elementProps}></paper-menu>
    );
  }
}

export namespace PaperMenuComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Sets the selected element, by default the value should be the index of a menu item. */
    selected?: string | number;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
    };
  }
}
