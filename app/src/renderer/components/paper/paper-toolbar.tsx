// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';

/**
 * React component that wraps a Polymer paper-toolbar custom element.
 */
export class PaperToolbarComponent
       extends PolymerComponent<PolymerElements.PaperToolbar, PaperToolbarComponent.IProps, {}> {

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperToolbarComponent.IProps) {
    return (
      <paper-toolbar {...props}></paper-toolbar>
    );
  }
}

namespace PaperToolbarComponent {
  export interface IProps extends PolymerComponent.IProps {
  }
}
