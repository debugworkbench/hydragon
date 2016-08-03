// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { PageModel } from './page-model';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { PaperIconButtonComponent, PaperToolbarComponent } from '../paper';
import { ContextComponent } from '../context';

/**
 * Page component that displays some arbitrary content in a PageSet component.
 */
@observer
@stylable
export class PageComponent extends ContextComponent<PageComponent.IProps, void, stylable.IContext> {
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
          {
            position: 'relative',
            padding: '10px',
            overflow: 'hidden'
          },
          IronFlexLayout.flex.auto
        ),
        '> .contentWrapper:hover': {
          overflowY: 'overlay'
        },
        '> .toolbar': IronFlexLayout.flex.none
      }
    ));
    this.className = `${this.props.className} ${this.styleId}`;
  }

  render() {
    const dirtyIndicator = this.props.model.isDirty ? '\u25cf ' : '';
    return (
      <div className="hydragon-page">
        <div className={this.className}>
          <PaperToolbarComponent className="toolbar"
            styles={{
              backgroundColor: 'rgb(30, 30, 30)',
              height: '30px',
              title: {
                'font-size': '14px',
                'margin-left': '10px'
              }
            }}>
            <div className="title">
              {dirtyIndicator + this.props.model.title}
            </div>
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

export namespace PageComponent {
  export interface IProps extends React.Props<PageComponent> {
    model: PageModel;
    className?: string;
  }

  export interface IContext extends stylable.IContext {
  }
}
