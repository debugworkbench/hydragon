// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { FreeStyle } from 'react-free-style';
import { PageSetModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import PageTreeItem from './page-tree-item';
import { makeFocusable, IFocusableState } from '../focusable';

export interface IProps extends React.Props<PageTreeComponentImpl> {
  width?: string;
  height?: string;
  pageSet?: PageSetModel;
}

interface IContext {
  freeStyle: FreeStyle.FreeStyle;
}

const SELECTED = 'selected';
const FOCUSED = 'focused';

/**
 * Component that displays the titles of the pages from a page-set in a tree view.
 */
@observer
export class PageTreeComponentImpl extends React.Component<IProps, IFocusableState, IContext> {
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
        [`&:not(.${FOCUSED}) > *.${SELECTED}`]: {
          backgroundColor: 'rgb(63, 63, 70)'
        },
        [`&:not(.${FOCUSED}) > *.${FOCUSED}:not(.${SELECTED})`]: {
          backgroundColor: 'rgb(47, 51, 52)'
        },
        [`&.${FOCUSED} > *.${FOCUSED}`]: {
          backgroundColor: 'rgb(7, 54, 85)'
        },
        [`&.${FOCUSED} > *.${SELECTED}`]: {
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
    let className = this.className;
    if (this.state.isFocused) {
      className += ` ${FOCUSED}`;
    }
    return (
      <div className={className} style={this.inlineStyle} tabIndex={0}>{
        this.props.pageSet.pages.map(page =>
          <PageTreeItem key={page.title} model={page} onDidClick={this.onDidClickItem}
            isSelected={this.props.pageSet.activePage === page} />
        )
      }</div>
    );
  }
}

const PageTreeComponent = makeFocusable(PageTreeComponentImpl);
export default PageTreeComponent;
