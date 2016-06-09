// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { IronFlexLayout } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, themable } from '../decorators';
import { ILayoutComponentProps, ILayoutComponent } from './layout-container';
import { IRequiresElementFactoryContext, requiresElementFactory } from '../element-factory';
import { PanelModel } from './panel-model';
import { PaperToolbarComponent } from '../paper';

/**
 * Container component that displays its content with an optional header.
 */
@observer
@stylable
@themable
@requiresElementFactory
export class PanelComponent
       extends React.Component<PanelComponent.IProps, {}, PanelComponent.IContext>
       implements ILayoutComponent {

  private styleId: string;
  private className: string;
  private element: HTMLDivElement;

  private _onSetRef = (ref: HTMLDivElement) => this.element = ref;
  private _onContextMenu = (event: React.MouseEvent) => this.props.model.showContextMenu();

  get id(): string {
    return this.props.model.id;
  }

  getClientSize(): { width: number; height: number } {
    if (this.element) {
      return { width: this.element.clientWidth, height: this.element.clientHeight };
    } else {
      throw new Error('Reference to DOM element not set.');
    }
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      position: 'relative',
      display: 'block',
      backgroundColor: this.context.theme.primaryBackgroundColor,
      '> .content-wrapper': IronFlexLayout.fit
    });
    this.className = `hydragon-panel ${this.styleId}`;
  }

  renderContent(): JSX.Element | JSX.Element[] {
    const model = this.props.model;

    if (model.showHeader) {
      return (
        <paper-header-panel>
          <PaperToolbarComponent
            styles={{
              backgroundColor: 'rgb(56, 56, 56)',
              height: '30px',
              title: {
                'font-size': '14px',
                'font-weight': 'bold',
                'text-transform': 'uppercase',
                'margin-left': '0'
              }
            }}>
            <div className="title">{model.title}</div>
          </PaperToolbarComponent>
          {
            model.items.map(
              item => this.context.elementFactory.createElement({ model: item, key: item.id })
            )
          }
        </paper-header-panel>
      );
    } else {
      return model.items.map(
        item => this.context.elementFactory.createElement({ model: item, key: item.id })
      );
    }
  }

  render() {
    const model = this.props.model;
    const inlineStyle = {
      width: (model.width !== undefined) ? model.width : undefined,
      height: (model.height !== undefined) ? model.height : undefined,
      flex: (model.mainAxisSize !== null) ? `0 0 ${model.mainAxisSize}` : undefined
    };

    return (
      <div className={this.className} style={inlineStyle} ref={this._onSetRef}
        onContextMenu={this._onContextMenu}>
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
