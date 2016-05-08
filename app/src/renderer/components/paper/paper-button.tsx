// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-button custom element.
 */
export class PaperButtonComponent
       extends PolymerComponent<PolymerElements.PaperButton, PaperButtonComponent.IProps, {}> {

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.backgroundColor) {
        vars['--paper-button-background-color'] = styles.backgroundColor;
      }
      if (styles.textColor) {
        vars['--paper-button-color'] = styles.textColor;
      }
    }
    return vars;
  }

  protected get eventBindings() {
    return [
      { event: 'tap', listener: 'onDidTap' }
    ];
  }

  protected renderElement(props: PaperButtonComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-button {...elementProps}></paper-button>
    );
  }
}

namespace PaperButtonComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Callback to invoke after the user taps on the button. */
    onDidTap?: (e: polymer.TapEvent) => void;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
    }
  }
}
