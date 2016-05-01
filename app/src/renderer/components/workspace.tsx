// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { LayoutContainerComponent } from './layout/layout-container';
import { IronFlexLayout } from './styles';
import { WorkspaceModel } from '../models/ui';
import { Observable, Subscription } from '@reactivex/rxjs';
import { stylable, IStylableContext } from './stylable';
import { Cursor } from '../renderer-context';
import { ElementFactory } from './element-factory';

export interface IProps extends React.Props<WorkspaceComponent> {
  model: WorkspaceModel;
  elementFactory: ElementFactory;

  overrideCursor(cursor: Cursor): void;
  resetCursor(): void;
}

export interface IContext extends IStylableContext {
}

/**
 * Chief UI wrangler component.
 */
@observer
@stylable
export class WorkspaceComponent extends React.Component<IProps, {}, IContext> {
  styleId: string;
  className: string;

  static childContextTypes = {
    elementFactory: React.PropTypes.object
  };

  getChildContext() {
    return { elementFactory: this.props.elementFactory };
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
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
    this.className = `hydragon-workspace ${this.styleId}`;

    if (window) {
      // while it's usually recommended to access the DOM in componentDidMount() this observable
      // has to be created before any child components are mounted
      this.props.model.windowDidResizeStream = Observable.fromEvent<void>(window, 'resize');
    }
  }

  componentWillUnmount(): void {
    this.props.model.windowDidResizeStream = null;
  }

  render() {
    const model = this.props.model;
    const modalDialogElement = model.modalDialog ?
      this.props.elementFactory.createElement({ model: model.modalDialog }) : null;

    return (
      <div className={this.className}>
        <LayoutContainerComponent model={model.rootLayoutContainer}
          overrideCursor={this.props.overrideCursor}
          resetCursor={this.props.resetCursor} />
        { modalDialogElement }
      </div>
    );
  }
}
