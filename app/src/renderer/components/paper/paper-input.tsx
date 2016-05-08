// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-input custom element.
 */
export class PaperInputComponent
       extends PolymerComponent<PolymerElements.PaperInput, PaperInputComponent.IProps, {}> {

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.unfocusedLabelColor) {
        vars['--paper-input-container-color'] = styles.unfocusedLabelColor;
      }
      if (styles.focusedLabelColor) {
        vars['--paper-input-container-focus-color'] = styles.focusedLabelColor;
      }
      if (styles.textColor) {
        vars['--paper-input-container-input-color'] = styles.textColor;
      }
    }
    return vars;
  }

  protected get eventBindings() {
    return [
      { event: 'change', listener: 'onDidChange' }
    ];
  }

  protected renderElement(props: PaperInputComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-input {...elementProps}></paper-input>
    );
  }

  get value(): string {
    return (this.element ? this.element.value : this.props.value) || '';
  }
}

namespace PaperInputComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Text that should be displayed in the input field. */
    value?: string;
    /**
     * Callback to invoke after the input field changes due to user interaction.
     * This callback will only be invoked after the focus leaves the input field,
     * so it won't be called for each and every character entered by the user.
     */
    onDidChange?: (e: CustomEvent) => void;
    styles?: {
      /** Label and underline color when the input field is not focused. */
      unfocusedLabelColor?: string;
      /** Label and underline color when the input field is focused. */
      focusedLabelColor?: string;
      /** Color of the text in the input field. */
      textColor?: string;
    }
  }
}
