// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-checkbox custom element.
 *
 * paper-checkbox is a button that can be either checked or unchecked.
 * The user can tap the checkbox to check or uncheck it.
 *
 * Example: <PaperCheckboxComponent checked>Label</PaperCheckboxComponent>
 */
export class PaperCheckboxComponent
       extends PolymerComponent<PolymerElements.PaperCheckbox, PaperCheckboxComponent.IProps> {

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.uncheckedBackgroundColor) {
        vars['--paper-checkbox-unchecked-background-color'] = styles.uncheckedBackgroundColor;
      }
      if (styles.uncheckedBorderColor) {
        vars['--paper-checkbox-unchecked-color'] = styles.uncheckedBorderColor;
      }
      if (styles.uncheckedInkColor) {
        vars['--paper-checkbox-unchecked-ink-color'] = styles.uncheckedInkColor;
      }
      if (styles.checkedColor) {
        vars['--paper-checkbox-checked-color'] = styles.checkedColor;
      }
      if (styles.checkedInkColor) {
        vars['--paper-checkbox-checked-ink-color'] = styles.checkedInkColor;
      }
      if (styles.checkmarkColor) {
        vars['--paper-checkbox-checkmark-color'] = styles.checkmarkColor;
      }
      if (styles.labelColor) {
        vars['--paper-checkbox-label-color'] = styles.labelColor;
      }
      if (styles.labelSpacing) {
        vars['--paper-checkbox-label-spacing'] = styles.labelSpacing;
      }
      if (styles.size) {
        vars['--paper-checkbox-size'] = styles.size;
      }
    }
    return vars;
  }

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperCheckboxComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-checkbox {...elementProps}></paper-checkbox>
    );
  }
}

export namespace PaperCheckboxComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Sets the state of the box, `true` means checked, and `false` means unchecked. */
    checked?: boolean;
    /** If `true`, the box toggles the active state with each tap or press of the spacebar. */
    toggles?: boolean;
    styles?: {
      /** Checkbox background color when the box is not checked, defaults to transparent. */
      uncheckedBackgroundColor?: string;
      /**
       * Checkbox border color when the box is not checked, when the box is checked the border
       * color will be set to [[checkedColor]].
       */
      uncheckedBorderColor?: string;
      /** Selected/focus ripple color when the box is not checked. */
      uncheckedInkColor?: string;
      /** Checkbox background and border color when the box is checked. */
      checkedColor?: string;
      /** Selected/focus ripple color when the box is checked. */
      checkedInkColor?: string;
      /** Checkmark color, defaults to white. */
      checkmarkColor?: string;
      /** Color of the label text. */
      labelColor?: string;
      /** Spacing between the label and the checkbox, defaults to 8px. */
      labelSpacing?: string;
      /** Size of the checkbox, defaults to 18px. */
      size?: string;
    };
  }
}
