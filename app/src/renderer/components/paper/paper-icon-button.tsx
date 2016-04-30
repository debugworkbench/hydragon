// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';

/**
 * React component that wraps a Polymer paper-icon-button custom element.
 */
export class PaperIconButtonComponent
       extends PolymerComponent<PolymerElements.PaperIconButton, PaperIconButtonComponent.IProps> {

  protected get eventBindings() {
    return [
      { event: 'tap', listener: 'onDidTap' }
    ];
  }

  protected renderElement(props: PaperIconButtonComponent.IProps) {
    return (
      <paper-icon-button {...props}></paper-icon-button>
    );
  }
}

namespace PaperIconButtonComponent {
  export interface IProps extends PolymerComponent.IProps {
    icon?: string;
    /** Callback to invoke after the user taps on the button. */
    onDidTap?: () => void;
  }
}
