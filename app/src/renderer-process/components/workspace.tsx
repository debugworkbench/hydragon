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

export interface IState {
}

export interface IContext {
  freeStyle: FreeStyle.FreeStyle;
}

/**
 * Chief UI wrangler component.
 */
export default class WorkspaceComponent extends React.Component<{}, IState, IContext> {
  styleId: string;
  className: string;
  pageSetComponent: PageSet;
  pageTreeComponent: PageTree;

  static contextTypes: React.ValidationMap<IContext> = {
    freeStyle: React.PropTypes.object.isRequired
  };

  private onSetPageSetRef = (ref: PageSet) => this.pageSetComponent = ref;
  private onSetPageTreeRef = (ref: PageTree) => this.pageTreeComponent = ref;

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
  }

  componentDidMount(): void {
    // FIXME: This update is forced in order to pass in the page-set to the page-tree via props,
    //        it would be better to avoid such manual wrangling. Perhaps the page-set ref should be
    //        stored in a transient/ui store that the page-tree can subscribe to, then the
    //        page-tree could force update itself if needed.
    this.forceUpdate();
  }

  render() {
    return (
      <div className={this.className}>
        <VerticalContainer>
          <Panel height={'48px'}>
            <DebugToolbar />
          </Panel>
          <HorizontalContainer>
            <VerticalContainer width={'300px'} resizable={true}>
              <Panel title={'Open Pages'} height={'300px'} resizable={true} showHeader={true}>
                <PageTree height={'100%'} pageSetComponent={this.pageSetComponent} ref={this.onSetPageTreeRef} />
              </Panel>
              <Panel title={'Explorer'} resizable={true} showHeader={true}>
                {/*<DirTree />*/}
              </Panel>
            </VerticalContainer>
            <VerticalContainer resizable={true}>
              <Panel>
                <PageSet height={'100%'} ref={this.onSetPageSetRef} />
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