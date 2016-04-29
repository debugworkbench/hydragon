// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { omitOwnProps } from '../../../common/utils';
import { replaceEventListener } from '../../utils';

const IRON_ACTIVATE_EVENT = 'iron-activate';

/**
 * React component that wraps a Polymer paper-dropdown-menu custom element.
 */
export class PaperDropdownMenuComponent extends React.Component<PaperDropdownMenuComponent.IProps, {}, {}> {
  private menu: PolymerElements.PaperDropdownMenu;
  private onSetRef = (ref: PolymerElements.PaperDropdownMenu) => this.menu = ref;

  /**
   * The derived "label" of the currently selected item.
   * This value is the label property on the selected item if set, or else the trimmed text content
   * of the selected item.
   */
  get selectedItemLabel(): string {
    return this.menu.selectedItemLabel;
  }

  /** Hide the dropdown content. */
  close(): void {
    this.menu.close();
  }

  componentDidMount(): void {
    replaceEventListener(this.menu, IRON_ACTIVATE_EVENT, null, this.props.onWillSelectItem);
  }

  componentWillUnmount(): void {
    replaceEventListener(this.menu, IRON_ACTIVATE_EVENT, this.props.onWillSelectItem, null);
  }

  componentWillUpdate(nextProps: PaperDropdownMenuComponent.IProps): void {
    replaceEventListener(
      this.menu, IRON_ACTIVATE_EVENT, this.props.onWillSelectItem, nextProps.onWillSelectItem
    );
  }

  render() {
    const props = omitOwnProps(this.props, ['onWillSelectItem']);
    return (
      <paper-dropdown-menu ref={this.onSetRef} {...props}></paper-dropdown-menu>
    );
  }
}

namespace PaperDropdownMenuComponent {
  export interface IProps extends React.HTMLAttributes {
    /**
     * Callback to invoke before an item is selected from the menu.
     * Call `e.preventDevault()` in the callback to prevent the item from being selected.
     */
    onWillSelectItem?: (e: PolymerElements.IronActivateEvent) => void;
  }
}
