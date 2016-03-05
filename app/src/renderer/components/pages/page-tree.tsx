// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { FreeStyle } from 'react-free-style';
import { PageSetModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import PageTreeItem from './page-tree-item';

export interface IProps extends React.Props<PageTreeComponent> {
  width?: string;
  height?: string;
  pageSet?: PageSetModel;
}

interface IContext {
  freeStyle: FreeStyle.FreeStyle;
}

/**
 * Component that displays the titles of the pages from a page-set in a tree view.
 */
@observer
export default class PageTreeComponent extends React.Component<IProps, {}, IContext> {
  inlineStyle: {
    width?: string;
    height?: string;
  } = {};

  styleId: string;
  className: string;

  static contextTypes: React.ValidationMap<IContext> = {
    freeStyle: React.PropTypes.object.isRequired
  };

  private onDidClickItem = (item: PageTreeItem) => this.props.pageSet.activatePage(item.props.model);

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        backgroundColor: 'rgb(37, 37, 38)',
        color: 'rgb(204, 204, 204)',
        cursor: 'pointer',
        '-webkit-user-select': 'none',
        outline: 'none'
      },
      IronFlexLayout.vertical,
      {
        '> *:hover': {
          backgroundColor: 'rgb(42, 45, 46)'
        },
        ':not([focused]) > *.selected': {
          backgroundColor: 'rgb(63, 63, 70)'
        },
        /* class based variant would be written as :host(:not(.focused)) > ::content > *.focused:not(.selected) */
        ':not([focused]) > *.focused:not(.selected)': {
          backgroundColor: 'rgb(47, 51, 52)'
        },
        /* class based variant would be written as :host(.focused) > ::content > *.selected */
        '[focused] > *.focused': {
          backgroundColor: 'rgb(7, 54, 85)'
        },
        '[focused] > *.selected': {
          backgroundColor: 'rgb(9, 71, 113)'
        }
      }
    ));
    this.className = `hydragon-page-tree ${this.styleId}`;

    if (this.props.width !== undefined) {
        this.inlineStyle.width = this.props.width;
    }
    if (this.props.height !== undefined) {
      this.inlineStyle.height = this.props.height;
    }
  }

  render() {
    return (
      <div className={this.className} style={this.inlineStyle}>{
        this.props.pageSet.pages.map(page =>
          <PageTreeItem key={page.title} model={page} onDidClick={this.onDidClickItem}
            isSelected={this.props.pageSet.activePage === page} />
        )
      }</div>
    );
  }
}
