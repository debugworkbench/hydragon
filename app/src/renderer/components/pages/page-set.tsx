// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { Observable } from '@reactivex/rxjs';
import { FreeStyle } from 'react-free-style';
import { PageSetModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import { stylable, IStylableContext } from '../stylable';

export interface IProps extends React.Props<PageSetComponent> {
  model: PageSetModel;
}

interface IContext extends IStylableContext {
}

/**
 * Component that displays only one page at a time from a set of pages.
 */
@observer
@stylable
export default class PageSetComponent extends React.Component<IProps, {}, IContext> {
  inlineStyle: {
    width?: string;
    height?: string;
  } = {};

  styleId: string;
  className: string;

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      position: 'relative',
      display: 'block',
      '> *': IronFlexLayout.fit
    });
    this.className = `hydragon-page-set ${this.styleId}`;

    if (this.props.model.width !== undefined) {
        this.inlineStyle.width = this.props.model.width;
    }
    if (this.props.model.height !== undefined) {
      this.inlineStyle.height = this.props.model.height;
    }
  }

  render() {
    const PageComponent = this.props.model.activePage ?
      this.props.model.activePage.ComponentClass : undefined;

    return (
      <div className={this.className} style={this.inlineStyle}>{
        PageComponent ? <PageComponent model={this.props.model.activePage} /> : undefined
      }</div>
    );
  }
}
