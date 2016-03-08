// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import VerticalContainer from './layout/vertical-container';
import HorizontalContainer from './layout/horizontal-container';
import Panel from './layout/panel';
import PageSet from './pages/page-set';
import PageTree from './pages/page-tree';
import DebugToolbar from './debug-toolbar';
import { FreeStyle } from 'react-free-style';
import { IronFlexLayout } from './styles';
import { WorkspaceModel } from '../models/ui';
import { Observable, Subscription } from '@reactivex/rxjs';
import { stylable, IStylableContext } from './stylable';

export interface IProps {
  model: WorkspaceModel;
}

export interface IState {
}

export interface IContext extends IStylableContext {
}

/**
 * Chief UI wrangler component.
 */
@stylable
export default class WorkspaceComponent extends React.Component<IProps, IState, IContext> {
  styleId: string;
  className: string;

  /** Observable hooked up to window.resize event. */
  private didResizeStream: Observable<void>;

  constructor() {
    super();
    this.state = {};
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
      this.didResizeStream = Observable.fromEvent<void>(window, 'resize');
    }
  }

  componentWillUnmount(): void {
    this.didResizeStream = null;
  }

  render() {
    // TODO: the layout should be governed by WorkspaceModel, so the model hierarchy will need to
    //       be traversed and a component rendered for each model
    const { mainPageSet } = this.props.model;
    return (
      <div className={this.className}>
        <VerticalContainer>
          <Panel height={'48px'}>
            <DebugToolbar />
          </Panel>
          <HorizontalContainer>
            <VerticalContainer width={'300px'} resizable={true}>
              <Panel title={'Open Pages'} height={'300px'} resizable={true} showHeader={true}>
                <PageTree height={'100%'} pageSet={mainPageSet} />
              </Panel>
              <Panel title={'Explorer'} resizable={true} showHeader={true}>
                {/*<DirTree />*/}
              </Panel>
            </VerticalContainer>
            <VerticalContainer resizable={true}>
              <Panel>
                <PageSet height={'100%'} model={mainPageSet} didResizeStream={this.didResizeStream} />
              </Panel>
              <Panel height={'20px'}>
                Status
              </Panel>
            </VerticalContainer>
          </HorizontalContainer>
        </VerticalContainer>
      </div>
    );
  }
}