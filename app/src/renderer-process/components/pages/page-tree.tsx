// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import PageSetComponent from './page-set';
import { IPageTreeElement } from '../../elements/pages/page-tree';

export interface IProps extends React.Props<PageTreeComponent> {
  width?: string;
  height?: string;
  pageSetComponent?: PageSetComponent;
}

/**
 * Component that displays the titles of the pages from a page-set in a tree view.
 *
 * Currently this component is just a simple wrapper for a custom element.
 */
export default class PageTreeComponent extends React.Component<IProps, {}, {}> {
  private pageTreeElement: IPageTreeElement;

  private onDidSetPageTreeRef = (ref: IPageTreeElement) => this.pageTreeElement = ref;

  componentDidMount(): void {
    if (this.props.pageSetComponent) {
      this.pageTreeElement.pageSet = this.props.pageSetComponent.pageSet;
    }
  }

  componentWillReceiveProps(nextProps: IProps): void {
    //console.log('PageTreeComponent WillReceiveProps');
    if (nextProps.pageSetComponent !== this.props.pageSetComponent) {
      this.pageTreeElement.pageSet = nextProps.pageSetComponent
        ? nextProps.pageSetComponent.pageSet
        : undefined;
    }
  }

  render() {
    return (
      <debug-workbench-page-tree
        ref={this.onDidSetPageTreeRef}
        style={{ width: this.props.width, height: this.props.height }}>
      </debug-workbench-page-tree>
    );
  }
}
