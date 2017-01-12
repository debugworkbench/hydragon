// Copyright (c) 2016-2017 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { Observable } from '@reactivex/rxjs';
import { LayoutContainerComponent } from '../layout/layout-container';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { Cursor } from '../../renderer-context';
import { darkWorkspaceTheme, IWorkspaceTheme } from './workspace-theme';
import { ContextComponent } from '../context';
import { WindowModel } from './window-model';

@stylable
@mobxReact.observer
export class WindowComponent
       extends ContextComponent<WindowComponent.IProps, void, WindowComponent.IContext> {

  private _styleId: string;
  private _className: string;
  private _windowDidResizeStream: Observable<void>;

  static childContextTypes = {
    theme: React.PropTypes.object,
    renderChild: React.PropTypes.func
  };

  getChildContext(): WindowComponent.IChildContext {
    return {
      theme: darkWorkspaceTheme,
      renderChild: this.props.renderChild
    };
  }

  componentWillMount(): void {
    this._styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        overflow: 'hidden'
      },
      IronFlexLayout.fit,
      IronFlexLayout.horizontal,
      {
        '> *': IronFlexLayout.flex.auto
      }
    ));
    this._className = `hydragon-workspace ${this._styleId}`;

    if (window) {
      // while it's usually recommended to access the DOM in componentDidMount() this observable
      // has to be created before any child components are mounted
      this._windowDidResizeStream = Observable.fromEvent<void>(window, 'resize');
    }
  }

  componentWillUnmount(): void {
    this._windowDidResizeStream = null;
  }

  private _onBeginSplitterResize = (direction: 'vertical' | 'horizontal'): void => {
    if (direction === 'vertical') {
      this.props.overrideCursor(Cursor.VerticalResize);
    } else {
      this.props.overrideCursor(Cursor.HorizontalResize);
    }
  }

  private _onEndSplitterResize = (): void => {
    this.props.resetCursor()
  }

  render() {
    return (
      <div className={this._className}>{
        this.props.renderChild(this.props.model.layout, {
          key: this.props.model.layout.id,
          windowDidResizeStream: this._windowDidResizeStream,
          onBeginSplitterResize: this._onBeginSplitterResize,
          onEndSplitterResize: this._onEndSplitterResize
        })
      }</div>
    );
  }
}

export namespace WindowComponent {
  export interface IProps extends React.Props<WindowComponent> {
    model: WindowModel;
    renderChild(model: any, props: any): React.ReactElement<any>;
    overrideCursor(cursor: Cursor): void;
    resetCursor(): void;
  }

  export type IContext = stylable.IContext;

  export interface IChildContext {
    theme: IWorkspaceTheme;
    renderChild(model: any, props: any): React.ReactElement<any>;
  }
}
