// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-button custom element.
 */
@themable
export class PaperButtonComponent
       extends PolymerComponent<
                 PolymerElements.PaperButton,
                 PaperButtonComponent.IProps,
                 PaperButtonComponent.IContext> {

  protected get cssVars() {
    const theme = this.context.theme;
    return {
      '--paper-button': {
        'background-color': theme.primaryBackgroundColor,
        'color': theme.primaryTextColor
      }
    };
  }

  protected get eventBindings() {
    return [
      { event: 'tap', listener: 'onDidTap' }
    ];
  }

  protected renderElement(props: PaperButtonComponent.IProps) {
    return (
      <paper-button {...props}></paper-button>
    );
  }
}

namespace PaperButtonComponent {
  export interface IProps extends PolymerComponent.IProps {
    /** Callback to invoke after the user taps on the button. */
    onDidTap?: (e: polymer.TapEvent) => void;
  }
  export interface IContext extends themable.IContext {
  }
}
