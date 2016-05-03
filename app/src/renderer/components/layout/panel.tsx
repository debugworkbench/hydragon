// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { IronFlexLayout } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, themable } from '../decorators';
import { ILayoutComponentProps, ILayoutComponent } from './layout-container';
import { IRequiresElementFactoryContext, requiresElementFactory } from '../element-factory';
import { PanelModel } from '../../models/ui';
import { PaperToolbarComponent } from '../paper';

/**
 * Container component that displays its content with an optional header.
 */
@observer
@stylable
@themable
@requiresElementFactory
export class PanelComponent extends React.Component<PanelComponent.IProps, {}, PanelComponent.IContext>
                            implements ILayoutComponent {
  private styleId: string;
  private className: string;
  private element: HTMLDivElement;

  private onSetRef = (ref: HTMLDivElement) => this.element = ref;

  get id(): string {
    return this.props.model.id;
  }

  getClientSize(): { width: number; height: number } {
    if (this.element) {
      return { width: this.element.clientWidth, height: this.element.clientHeight };
    } else {
      throw new Error('Reference to DOM element not set.')
    }
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      position: 'relative',
      display: 'block',
      backgroundColor: 'rgb(37, 37, 38)',
      '> .content-wrapper': IronFlexLayout.fit
    });
    this.className = `hydragon-panel ${this.styleId}`;
  }

  renderContent(): JSX.Element | JSX.Element[] {
    const theme = this.context.theme;
    if (this.props.model.showHeader) {
      return (
        <paper-header-panel>
          <PaperToolbarComponent
            cssVars={{
              '--paper-toolbar-background': 'rgb(56, 56, 56)',
              '--paper-toolbar-color': theme.primaryTextColor,
              '--paper-toolbar-height': '30px',
              '--paper-toolbar-title': {
                'font-size': '14px',
                'font-weight': 'bold',
                'text-transform': 'uppercase',
                'margin-left': '0'
              }
            }}>
            <div className="title">{this.props.model.title}</div>
          </PaperToolbarComponent>
          {
            this.props.model.items.map(
              item => this.context.elementFactory.createElement({ model: item, key: item.id })
            )
          }
        </paper-header-panel>
      );
    } else {
      return this.props.model.items.map(
        item => this.context.elementFactory.createElement({ model: item, key: item.id })
      );
    }
  }

  render() {
    const inlineStyle = {
      width: (this.props.model.width !== undefined) ? this.props.model.width : undefined,
      height: (this.props.model.height !== undefined) ? this.props.model.height : undefined,
      flex: (this.props.model.mainAxisSize !== null) ? `0 0 ${this.props.model.mainAxisSize}` : undefined
    }

    return (
      <div className={this.className} style={inlineStyle} ref={this.onSetRef}>
        <div className="content-wrapper">
        {this.renderContent()}
        </div>
      </div>
    );
  }
}

export namespace PanelComponent {
  export interface IProps extends ILayoutComponentProps<PanelComponent> {
    model: PanelModel;
  }

  export interface IContext
         extends stylable.IContext, themable.IContext, IRequiresElementFactoryContext {
  }
}