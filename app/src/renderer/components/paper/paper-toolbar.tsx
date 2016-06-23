// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-toolbar custom element.
 */
export class PaperToolbarComponent
       extends PolymerComponent<PolymerElements.PaperToolbar, PaperToolbarComponent.IProps, {}> {

  protected get cssVars(): any {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.title) {
        vars['--paper-toolbar-title'] = styles.title;
      }
      if (styles.backgroundColor) {
        vars['--paper-toolbar-background'] = styles.backgroundColor;
      }
      if (styles.textColor) {
        vars['--paper-toolbar-color'] = styles.textColor;
      }
      if (styles.height) {
        vars['--paper-toolbar-height'] = styles.height;
      }
    }
    return vars;
  }

  protected get eventBindings(): PolymerComponent.IEventBinding[] {
    return [];
  }

  protected renderElement(props: PaperToolbarComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-toolbar {...elementProps}></paper-toolbar>
    );
  }
}

export namespace PaperToolbarComponent {
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
}
