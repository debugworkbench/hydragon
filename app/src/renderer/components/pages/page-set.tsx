// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { Observable } from '@reactivex/rxjs';
import { FreeStyle } from 'react-free-style';
import { PageSetModel } from './page-set-model';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { requiresElementFactory, IRequiresElementFactoryContext } from '../element-factory';

export interface IProps extends React.Props<PageSetComponent> {
  model: PageSetModel;
}

export interface IContext extends stylable.IContext, IRequiresElementFactoryContext {
}

/**
 * Component that displays only one page at a time from a set of pages.
 */
@observer
@stylable
@requiresElementFactory
export class PageSetComponent extends React.Component<IProps, {}, IContext> {
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
    return (
      <div className={this.className} style={this.inlineStyle}>{
        this.props.model.activePage
          ? this.context.elementFactory.createElement({ model: this.props.model.activePage })
          : undefined
      }</div>
    );
  }
}
