// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-dialog custom element.
 */
@themable
export class PaperDialogComponent
       extends PolymerComponent<
                 PolymerElements.PaperDialog,
                 PaperDialogComponent.IProps,
                 PaperDialogComponent.IContext> {

  protected elementRefDidChange(ref: PolymerElements.PaperDialog): void {
    this.syncState();
  }

  protected get cssVars() {
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-dialog-background-color': styles.backgroundColor || theme.primaryBackgroundColor,
      '--paper-dialog-color': styles.textColor || theme.primaryTextColor,
      '--paper-dialog-button-color': styles.buttonColor || theme.primaryColor
    };
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
    return (
      <paper-dialog {...props}></paper-dialog>
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

  export interface IContext extends themable.IContext {
  }
}
