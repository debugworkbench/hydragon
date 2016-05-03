// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { PolymerComponent } from './polymer';
import { themable } from '../decorators';

/**
 * React component that wraps a Polymer paper-dropdown-menu custom element.
 */
@themable
export class PaperDropdownMenuComponent
       extends PolymerComponent<
                 PolymerElements.PaperDropdownMenu,
                 PaperDropdownMenuComponent.IProps,
                 PaperDropdownMenuComponent.IContext> {

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
    const theme = this.context.theme;
    const styles = this.props.styles || {};
    return {
      '--paper-input-container-input-color': styles.textColor || theme.primaryTextColor
    };
  }

  protected get eventBindings() {
    return [
      { event: 'iron-activate', listener: 'onWillSelectItem' }
    ];
  }

  protected renderElement(props: PaperDropdownMenuComponent.IProps) {
    return (
      <paper-dropdown-menu {...props}></paper-dropdown-menu>
    );
  }
}

namespace PaperDropdownMenuComponent {
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

  export interface IContext extends themable.IContext {
  }
}
