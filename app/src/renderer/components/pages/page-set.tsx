// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { IPageSetElement } from '../../elements/pages/page-set';

export interface IProps extends React.Props<PageSetComponent> {
  width?: string;
  height?: string;
}

/**
 * Component that displays only one element at a time from a set of page elements.
 * The child elements must be of type debug-workbench-page.
 *
 * Currently this component is just a simple wrapper for a custom element.
 */
export default class PageSetComponent extends React.Component<IProps, {}, {}> {
  private pageSetElement: IPageSetElement;

  private onDidSetPageSetRef = (ref: IPageSetElement) => this.pageSetElement = ref;

  get pageSet(): IPageSetElement {
    return this.pageSetElement;
  }

  render() {
    return (
      <debug-workbench-page-set
        ref={this.onDidSetPageSetRef}
        style={{ width: this.props.width, height: this.props.height }}>
      </debug-workbench-page-set>
    );
  }
}
