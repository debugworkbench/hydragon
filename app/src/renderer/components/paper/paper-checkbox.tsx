// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-checkbox custom element.
 *
 * paper-checkbox is a button that can be either checked or unchecked.
 * The user can tap the checkbox to check or uncheck it.
 *
 * Example: <PaperCheckboxComponent checked>Label</PaperCheckboxComponent>
 */
@themable
export class PaperCheckboxComponent
       extends PolymerComponent<
                 PolymerElements.PaperCheckbox,
                 PaperCheckboxComponent.IProps,
                 PaperCheckboxComponent.IContext> {

  protected get cssVars() {
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-checkbox-unchecked-background-color': styles.uncheckedBackgroundColor || undefined,
      '--paper-checkbox-unchecked-color': styles.uncheckedBorderColor || theme.primaryTextColor,
      '--paper-checkbox-unchecked-ink-color': styles.uncheckedInkColor || theme.primaryTextColor,
      '--paper-checkbox-checked-color': styles.checkedColor || theme.primaryColor,
      '--paper-checkbox-checked-ink-color': styles.checkedInkColor || theme.primaryColor,
      '--paper-checkbox-checkmark-color': styles.checkmarkColor || undefined,
      '--paper-checkbox-label-color': styles.labelColor || theme.primaryTextColor,
      '--paper-checkbox-label-spacing': styles.labelSpacing || undefined,
      '--paper-checkbox-size': styles.size || undefined
    };
  }

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperCheckboxComponent.IProps) {
    return (
      <paper-checkbox {...props}></paper-checkbox>
    );
  }
}

namespace PaperCheckboxComponent {
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
    }
  }

  export interface IContext extends themable.IContext {
  }
}
