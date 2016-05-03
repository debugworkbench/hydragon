// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-toolbar custom element.
 */
@themable
export class PaperToolbarComponent
       extends PolymerComponent<
                 PolymerElements.PaperToolbar,
                 PaperToolbarComponent.IProps,
                 PaperToolbarComponent.IContext> {

  protected get cssVars() {
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-toolbar-title': styles.title || undefined,
      '--paper-toolbar-background': styles.backgroundColor || theme.primaryBackgroundColor,
      '--paper-toolbar-color': styles.textColor || theme.primaryTextColor,
      '--paper-toolbar-height': styles.height || undefined
    };
  }

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
    styles?: {
      /** Style mixin to apply to the title of the toolbar. */
      title?: any;
      backgroundColor?: string;
      textColor?: string;
      /** Height of the toolbar, defaults to `64px`. */
      height?: string;
    };
  }

  export interface IContext extends themable.IContext {
  }
}
