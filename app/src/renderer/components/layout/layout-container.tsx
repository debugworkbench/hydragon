// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { SplitterComponent } from './splitter';
import { PanelComponent } from './panel';
import { Cursor } from '../../renderer-context';
import {
  LayoutContainerModel, SplitterModel, PanelModel, LayoutItemModel
} from '../../models/ui';
import {
  requiresElementFactory, IRequiresElementFactoryContext, ElementFactory
} from '../element-factory';

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
@observer
@stylable
@requiresElementFactory
export class LayoutContainerComponent
       extends React.Component<LayoutContainerComponent.IProps, {}, LayoutContainerComponent.IContext>
       implements ILayoutComponent {

  private styleId: string;
  private className: string;
  private element: HTMLDivElement;
  /** All child components that aren't splitters. */
  private childComponents = new Map</*id:*/string, ILayoutComponent>();

  private onSetRef = (ref: HTMLDivElement) => {
    this.element = ref;
    if (this.props.onSetRef) {
      this.props.onSetRef(this.id, this);
    }
  }

  private onSetChildRef = (id: string, ref: ILayoutComponent) => {
    if (ref) {
      this.childComponents.set(id, ref);
    } else {
      this.childComponents.delete(id);
    }
  }

  constructor(props: LayoutContainerComponent.IProps, context: LayoutContainerComponent.IContext) {
    super(props, context);
  }

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

  private onBeginSplitterResize = (): void => {
    if (this.props.model.direction === 'vertical') {
      this.props.overrideCursor(Cursor.VerticalResize);
    } else {
      this.props.overrideCursor(Cursor.HorizontalResize);
    }
  }

  private onEndSplitterResize = (): void => {
    this.props.resetCursor()
  }

  private adjustSiblingSize = (splitter: SplitterModel, delta: { width?: number; height?: number }): void => {
    const resizeeComponent = this.childComponents.get(splitter.resizee.id);
    if (resizeeComponent) {
      const { width, height } = resizeeComponent.getClientSize();
      if (this.props.model.direction === 'horizontal') {
        this.props.model.resizeItem(splitter.resizee, `${width + delta.width}px`);
      } else {
        this.props.model.resizeItem(splitter.resizee, `${height + delta.height}px`);
      }
    }
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        overflow: 'hidden'
      },
      this.props.model.direction === 'vertical' ? IronFlexLayout.vertical : IronFlexLayout.horizontal,
      {
        '> *': IronFlexLayout.flex.auto,
        '> .hydragon-vertical-splitter, .hydragon-horizontal-splitter': IronFlexLayout.flex.none
      }
    ));
    this.className = `hydragon-${this.props.model.direction}-container ${this.styleId}`;
  }

  private renderers = new Map<any, (model: LayoutItemModel | SplitterModel) => JSX.Element>([
    [LayoutContainerModel, model => this.renderLayoutContainer(model as LayoutContainerModel)],
    [PanelModel, model => this.renderPanel(model as PanelModel)],
    [SplitterModel, model => this.renderSplitter(model as SplitterModel)]
  ]);

  renderLayoutContainer(model: LayoutContainerModel): JSX.Element {
    return (
      <LayoutContainerComponent model={model}
        key={model.id}
        onSetRef={this.onSetChildRef}
        overrideCursor={this.props.overrideCursor}
        resetCursor={this.props.resetCursor} />
    );
  }

  renderPanel(model: PanelModel): JSX.Element {
    return (
      <PanelComponent model={model}
        key={model.id}
        onSetRef={this.onSetChildRef} />
    );
  }

  renderSplitter(model: SplitterModel): JSX.Element {
    return (
      <SplitterComponent model={model}
        key={model.id}
        adjustSiblingSize={this.adjustSiblingSize}
        onBeginSplitterResize={this.onBeginSplitterResize}
        onEndSplitterResize={this.onEndSplitterResize} />
    );
  }

  render() {
    const inlineStyle = {
      width: (this.props.model.width !== undefined) ? this.props.model.width : undefined,
      height: (this.props.model.height !== undefined) ? this.props.model.height : undefined,
      flex: (this.props.model.mainAxisSize !== null) ? `0 0 ${this.props.model.mainAxisSize}` : undefined
    }

    return (
      <div className={this.className} style={inlineStyle} ref={this.onSetRef}>{
        this.props.model.items.map(item => {
          const renderChild = this.renderers.get(item.constructor);
          return renderChild(item);
        })
      }</div>
    );
  }
}

export namespace LayoutContainerComponent {
  export interface IProps extends ILayoutComponentProps<LayoutContainerComponent> {
    model: LayoutContainerModel;

    // callbacks passed through to splitter components
    overrideCursor?: (cursor: Cursor) => void;
    resetCursor?: () => void;
  }

  export interface IContext extends stylable.IContext, IRequiresElementFactoryContext {
  }
}