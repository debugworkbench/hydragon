// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-input custom element.
 */
@themable
export class PaperInputComponent
       extends PolymerComponent<
                 PolymerElements.PaperInput,
                 PaperInputComponent.IProps,
                 PaperInputComponent.IContext> {

  protected get cssVars() {
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-input-container-color': styles.unfocusedLabelColor || theme.secondaryTextColor,
      '--paper-input-container-focus-color': styles.focusedLabelColor || theme.primaryColor,
      '--paper-input-container-input-color': styles.textColor || theme.primaryTextColor
    };
  }

  protected get eventBindings() {
    return [
      { event: 'change', listener: 'onDidChange' }
    ];
  }

  protected renderElement(props: PaperInputComponent.IProps) {
    console.log(`Render: ${this.props.label}: ${this.props.value}`);
    return (
      <paper-input {...props}></paper-input>
    );
  }
}

namespace PaperInputComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** The text currently displayed in the input field. */
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
  export interface IContext extends themable.IContext {
  }
}
