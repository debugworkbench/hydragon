// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobx from 'mobx';
import { Observable, Subject, Subscription } from '@reactivex/rxjs';
import { observer } from 'mobx-react';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { PanelComponent } from './panel';
import { LayoutContainerModel } from './layout-container-model';
import { PanelModel } from './panel-model';
import { ContextComponent } from '../context';
import { SplitterModel } from './splitter-model';

export interface ILayoutComponentProps<T> extends React.Props<T> {
  resizable?: boolean;
  onSetRef?(id: string, ref: ILayoutComponent): void;
}

export interface ILayoutComponent {
  id: string;
  getClientSize(): { width: number; height: number };
}

/**
 * Container component that lays out its children vertically or horizontally using flex-box.
 *
 * The container's children must either be containers or panels, splitter elements will be
 * automatically injected between resizable children.
 */
@stylable
@observer
export class LayoutContainerComponent
       extends ContextComponent<
         LayoutContainerComponent.IProps, void, LayoutContainerComponent.IContext>
       implements ILayoutComponent {

  static contextTypes = {
    freeStyle: React.PropTypes.object.isRequired,
    renderChild: React.PropTypes.func.isRequired
  };

  private _styleId: string;
  private _className: string;
  private _element: HTMLDivElement;
  /** All child components that aren't splitters. */
  private _childComponents = new Map</*id:*/string, ILayoutComponent>();
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

  private _onSetChildRef = (id: string, ref: ILayoutComponent) => {
    if (ref) {
      this._childComponents.set(id, ref);
    } else {
      this._childComponents.delete(id);
    }
  }

  get id(): string {
    return this.props.model.id;
  }

  getClientSize(): { width: number; height: number } {
    if (this._element) {
      return { width: this._element.clientWidth, height: this._element.clientHeight };
    } else {
      throw new Error('Reference to DOM element not set.')
    }
  }

  @mobx.action
  private _adjustElementSize = (id: string, delta: { width?: number; height?: number }): void => {
    const resizeeComponent = this._childComponents.get(id);
    const resizeeModel = this.props.model.items.find(item => item.id === id);
    if (resizeeComponent && resizeeModel && !(resizeeModel instanceof SplitterModel)) {
      const { width, height } = resizeeComponent.getClientSize();
      if (this.props.model.direction === 'horizontal') {
        resizeeModel.width = `${width + delta.width}px`;
      } else {
        resizeeModel.height = `${height + delta.height}px`;
      }
      this._didResizeStream.next(null);
    }
  }

  componentWillMount(): void {
    const { model } = this.props;
    this._styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        overflow: 'hidden'
      },
      model.direction === 'vertical' ? IronFlexLayout.vertical : IronFlexLayout.horizontal,
      {
        '> *': IronFlexLayout.flex.auto,
        '> .hydragon-vertical-splitter, .hydragon-horizontal-splitter': IronFlexLayout.flex.none
      }
    ));
    this._className = `hydragon-${model.direction}-container ${this._styleId}`;
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

  render() {
    const { model } = this.props;
    const inlineStyle = {
      width: (model.width !== undefined) ? model.width : undefined,
      height: (model.height !== undefined) ? model.height : undefined,
      flex: (this.props.flexBasis !== undefined) ? `0 0 ${this.props.flexBasis}` : undefined
    };

    return (
      <div className={this._className} style={inlineStyle} ref={this._onSetRef}>{
        model.items.map(child => {
          let onSetRef = null;
          let flexBasis;
          if (!(child instanceof SplitterModel)) {
            onSetRef = this._onSetChildRef;
            flexBasis = (model.direction === 'vertical') ? child.height : child.width;
          }
          return this.context.renderChild(child, {
            key: child.id,
            onSetRef,
            parentDidResizeStream: this.props.parentDidResizeStream,
            flexBasis,
            adjustElementSize: this._adjustElementSize,
            onBeginSplitterResize: this.props.onBeginSplitterResize,
            onEndSplitterResize: this.props.onEndSplitterResize
          });
        })
      }</div>
    );
  }
}

export namespace LayoutContainerComponent {
  export interface IProps extends ILayoutComponentProps<LayoutContainerComponent> {
    model: LayoutContainerModel;
    flexBasis?: string;
    /**
     * Stream that yields a `null` value whenever the browser window or the parent container is
     * resized.
     */
    parentDidResizeStream?: Observable<void>;
    onBeginSplitterResize(direction: 'vertical' | 'horizontal'): void;
    onEndSplitterResize(): void;
  }

  export interface IContext extends stylable.IContext {
    renderChild(model: any, props: any): React.ReactElement<any>;
  }
}
