// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-input custom element.
 */
export class PaperInputComponent
       extends PolymerComponent<PolymerElements.PaperInput, PaperInputComponent.IProps> {

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

  private onDidChange = (e: CustomEvent) => {
    if (this.props.onDidChange) {
      this.props.onDidChange(this.element.value);
    }
  }

  protected get eventBindings() {
    return [
      { event: 'change', listener: this.onDidChange }
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

export namespace PaperInputComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Text that should be displayed in the input field. */
    value?: string;
    /** Type of control to display, defaults to `text`. */
    type?: 'text' | 'number' | 'password';
    /**
     * Minimum (numeric or date-time) value, which must not be greater than [[max]].
     * Note that this minimum is not strictly enforced, it will be enforced only when the value is
     * decremented by the control itself, but the user is still free to type in any value they wish.
     */
    min?: string | number;
    /**
     * Maximum (numeric or date-time) value, which must not be less than [[min]].
     * Note that this maximum is not strictly enforced, it will be enforced only when the value is
     * incremented by the control itself, but the user is still free to type in any value they wish.
     */
    max?: string | number;
    /**
     * Works with [[min]] and [[max]] to limit the increments at which a numeric or
     * date-time value can be set. It can be the string any or a positive floating point number.
     * If this is not set the control accepts only values at multiples of the step value greater
     * than [[minimum]].
     */
    step?: string | number;
    /**
     * Callback to invoke after the input field changes due to user interaction.
     * This callback will only be invoked after the focus leaves the input field,
     * so it won't be called for each and every character entered by the user.
     */
    onDidChange?: (newValue: string) => void;
    styles?: {
      /** Label and underline color when the input field is not focused. */
      unfocusedLabelColor?: string;
      /** Label and underline color when the input field is focused. */
      focusedLabelColor?: string;
      /** Color of the text in the input field. */
      textColor?: string;
    };
  }
}
