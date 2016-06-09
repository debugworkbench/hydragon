// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-icon-button custom element.
 */
export class PaperIconButtonComponent
       extends PolymerComponent<
                 PolymerElements.PaperIconButton, PaperIconButtonComponent.IProps, {}> {

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.enabled) {
        vars['--paper-icon-button'] = styles.enabled;
      }
      if (styles.disabled) {
        vars['--paper-icon-button-disabled'] = styles.disabled;
      }
      if (styles.hover) {
        vars['--paper-input-button-hover'] = styles.hover;
      }
    }
    return vars;
  }

  protected get eventBindings() {
    return [
      { event: 'tap', listener: 'onDidTap' }
    ];
  }

  protected renderElement(props: PaperIconButtonComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-icon-button {...elementProps}></paper-icon-button>
    );
  }
}

namespace PaperIconButtonComponent {
  export interface IProps extends PolymerComponent.IProps {
    icon?: string;
    styles?: {
      /** CSS mixin to apply to the paper-icon-button. */
      enabled?: React.CSSProperties;
      /** CSS mixin to apply to the paper-icon-button when it's disabled. */
      disabled?: React.CSSProperties;
      /** CSS mixin to apply to the paper-icon-button on hover. */
      hover?: React.CSSProperties;
    };
    /** Callback to invoke after the user taps on the button. */
    onDidTap?: (e: polymer.TapEvent) => void;
  }
}
