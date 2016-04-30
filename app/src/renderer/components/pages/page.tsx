// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { PageModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, IStylableContext } from '../stylable';
import { PaperIconButtonComponent, PaperToolbarComponent } from '../paper';

export interface IProps extends React.Props<PageComponent> {
  model: PageModel;
  className?: string;
}

/**
 * Page component that displays some arbitrary content in a PageSet component.
 */
@observer
@stylable
export class PageComponent extends React.Component<IProps, {}, IStylableContext> {
  styleId: string;
  className: string;

  private onDidTapClose = () => this.props.model.close();

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        outline: 'none',
        width: '100%',
        height: '100%'
      },
      IronFlexLayout.vertical,
      {
        '> .contentWrapper': Object.assign(
          { position: 'relative' },
          IronFlexLayout.flex.auto
        ),
        '> .toolbar': IronFlexLayout.flex.none
      }
    ));
    this.className = `${this.props.className} ${this.styleId}`;
  }

  render() {
    return (
      <div className="hydragon-page">
        <div className={this.className}>
          <PaperToolbarComponent className="toolbar"
            cssVars={{
              '--paper-toolbar-background': 'rgb(30, 30, 30)',
              '--paper-toolbar-color': 'rgb(204, 204, 204)',
              '--paper-toolbar-height': '30px',
              '--paper-toolbar-title': {
                'font-size': '14px',
                'margin-left': '10px'
              }
            }}>
            <div className="title">{this.props.model.title}</div>
            <PaperIconButtonComponent
              icon="icons:close" alt="Close Page"
              onDidTap={this.onDidTapClose}
              cssVars={{
                '--paper-icon-button': {
                  width: '30px',
                  height: '30px',
                  padding: '5px'
                }
              }}/>
          </PaperToolbarComponent>
          <div className="contentWrapper">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
