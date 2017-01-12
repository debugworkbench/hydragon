// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { Observable, Subject, Subscription } from '@reactivex/rxjs';
import { IronFlexLayout } from '../styles';
import { stylable, themable } from '../decorators';
import { ILayoutComponent, ILayoutComponentProps } from './layout-container';
import { PanelModel } from './panel-model';
import { PaperToolbarComponent } from '../paper';
import { ContextComponent } from '../context';

/**
 * Container component that displays its content with an optional header.
 */
@stylable
@themable
@observer
export class PanelComponent
       extends ContextComponent<PanelComponent.IProps, void, PanelComponent.IContext>
       implements ILayoutComponent {

  static contextTypes = {
    theme: React.PropTypes.object.isRequired,
    freeStyle: React.PropTypes.object.isRequired,
    renderChild: React.PropTypes.func.isRequired
  };

  private _styleId: string;
  private _className: string;
  private _element: HTMLDivElement;

  /**
   * Stream that will yield a `null` value whenever the size of the element bound to this model
   * may have changed. Elements that perform some computation based on their actual size should
   * rerun those computations whenever this stream yields a value to account for any change in size.
   */
  private _didResizeStream = new Subject<void>();
  private _didResizeStreamSub: Subscription;

  private _onSetRef = (ref: HTMLDivElement) => {
    this._element = ref;
    if (this.props.onSetRef) {
      this.props.onSetRef(this.id, this);
    }
  }

  get id(): string {
    return this.props.model.id;
  }

  getClientSize(): { width: number; height: number } {
    if (this._element) {
      return { width: this._element.clientWidth, height: this._element.clientHeight };
    } else {
      throw new Error('Reference to DOM element not set.');
    }
  }

  componentWillMount(): void {
    this._styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      position: 'relative',
      display: 'block',
      backgroundColor: this.context.theme.primaryBackgroundColor,
      '> .content-wrapper': IronFlexLayout.fit
    });
    this._className = `hydragon-panel ${this._styleId}`;
  }

  componentDidMount(): void {
    if (this.props.parentDidResizeStream) {
      this._didResizeStreamSub = this.props.parentDidResizeStream.subscribe(this._didResizeStream);
    }
  }

  componentWillUnmount(): void {
    if (this._didResizeStreamSub) {
      this._didResizeStreamSub.unsubscribe();
    }
    this._didResizeStream = null;
  }

  renderContent(): JSX.Element | JSX.Element[] {
    const { model } = this.props;
    const items = model.items.map(
      item => this.context.renderChild(item, { key: item.id })
    );

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
          { items }
        </paper-header-panel>
      );
    } else {
      return items;
    }
  }

  render() {
    const { model } = this.props;
    const inlineStyle = {
      width: (model.width !== undefined) ? model.width : undefined,
      height: (model.height !== undefined) ? model.height : undefined,
      flex: (this.props.flexBasis !== undefined) ? `0 0 ${this.props.flexBasis}` : undefined
    };

    return (
      <div className={this._className} style={inlineStyle} ref={this._onSetRef}>
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
    flexBasis?: string;
    parentDidResizeStream?: Observable<void>;
  }

  export interface IContext
         extends stylable.IContext, themable.IContext {
    renderChild(model: any, props: any): React.ReactElement<any>;
  }
}
