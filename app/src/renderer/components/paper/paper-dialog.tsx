// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-dialog custom element.
 */
export class PaperDialogComponent
       extends PolymerComponent<PolymerElements.PaperDialog, PaperDialogComponent.IProps, {}> {

  protected elementRefDidChange(ref: PolymerElements.PaperDialog): void {
    this.syncState();
  }

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.backgroundColor) {
        vars['--paper-dialog-background-color'] = styles.backgroundColor;
      }
      if (styles.textColor) {
        vars['--paper-dialog-color'] = styles.textColor;
      }
      if (styles.buttonColor) {
        vars['--paper-dialog-button-color'] = styles.buttonColor;
      }
    }
    return vars;
  }

  /** Push state changes from the component to the custom element. */
  private syncState(): void {
    if (this.element && (this.props.isOpen !== this.element.opened)) {
      this.props.isOpen ? this.element.open() : this.element.close();
    }
  }

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperDialogComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-dialog {...elementProps}></paper-dialog>
    );
  }

  componentDidUpdate(prevProps: PaperDialogComponent.IProps): void {
    this.syncState();
  }
}

namespace PaperDialogComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Set to `true` to open the dialog, `false` to close it. */
    isOpen: boolean;
    modal?: boolean;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
      buttonColor?: string;
    };
  }
}
