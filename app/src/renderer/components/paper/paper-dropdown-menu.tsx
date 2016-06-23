// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { omitOwnProps } from '../../../common/utils';

/**
 * React component that wraps a Polymer paper-dropdown-menu custom element.
 */
export class PaperDropdownMenuComponent
       extends PolymerComponent<
                 PolymerElements.PaperDropdownMenu,
                 PaperDropdownMenuComponent.IProps,
                 {}> {

  /**
   * The derived "label" of the currently selected item.
   * This value is the label property on the selected item if set, or else the trimmed text content
   * of the selected item.
   */
  get selectedItemLabel(): string {
    return this.element.selectedItemLabel;
  }

  /** Hide the dropdown content. */
  close(): void {
    this.element.close();
  }

  protected get cssVars() {
    const styles = this.props.styles;
    const vars: any = {};

    if (styles) {
      if (styles.textColor) {
        vars['--paper-input-container-input-color'] = styles.textColor;
      }
    }
    return vars;
  }

  protected get eventBindings() {
    return [
      { event: 'iron-activate', listener: 'onWillSelectItem' }
    ];
  }

  protected renderElement(props: PaperDropdownMenuComponent.IProps) {
    const elementProps = omitOwnProps(props, ['styles']);
    return (
      <paper-dropdown-menu {...elementProps}></paper-dropdown-menu>
    );
  }
}

export namespace PaperDropdownMenuComponent {
  export interface IProps extends PolymerComponent.IProps {
    styles?: {
      textColor?: string;
    };
    /**
     * Callback to invoke before an item is selected from the menu.
     * Call `e.preventDevault()` in the callback to prevent the item from being selected.
     */
    onWillSelectItem?: (e: PolymerElements.IronActivateEvent) => void;
  }
}
