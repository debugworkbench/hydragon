// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { FreeStyle } from 'react-free-style';
import { PageTreeModel } from './page-tree-model';
import { IronFlexLayout } from '../styles';
import { PageTreeItemComponent } from './page-tree-item';
import { makeFocusable, IFocusableState } from '../focusable';
import { stylable, themable } from '../decorators';
import { ContextComponent } from '../context';

export interface IProps extends React.Props<PageTreeComponentImpl> {
  model: PageTreeModel;
}

export interface IContext extends stylable.IContext, themable.IContext {
}

const SELECTED = 'selected';
const FOCUSED = 'focused';

/**
 * Component that displays the titles of the pages from a page-set in a tree view.
 */
@observer
@stylable
@themable
export class PageTreeComponentImpl extends ContextComponent<IProps, IFocusableState, IContext> {
  inlineStyle: {
    width?: string;
    height?: string;
  } = {};

  styleId: string;
  className: string;

  private onDidClickItem = (item: PageTreeItemComponent) => {
    this.props.model.activatePage(item.props.model);
  };

  componentWillMount(): void {
    const theme = this.context.theme;
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        backgroundColor: theme.primaryBackgroundColor,
        color: theme.primaryTextColor,
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

    if (this.props.model.width !== undefined) {
        this.inlineStyle.width = this.props.model.width;
    }
    if (this.props.model.height !== undefined) {
      this.inlineStyle.height = this.props.model.height;
    }
  }

  render() {
    let className = this.className;
    if (this.state.isFocused) {
      className += ` ${FOCUSED}`;
    }
    return (
      <div className={className} style={this.inlineStyle} tabIndex={0}>{
        this.props.model.pages.map(page =>
          <PageTreeItemComponent key={page.title} model={page} onDidClick={this.onDidClickItem}
            isSelected={this.props.model.activePage === page} />
        )
      }</div>
    );
  }
}

export const PageTreeComponent = makeFocusable(PageTreeComponentImpl);
