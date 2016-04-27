// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { Subject, Observable } from '@reactivex/rxjs';
import { PageSetModel } from './pages/page-set';
import { PageTreeModel } from './pages/page-tree';
import { LayoutContainerModel } from './layout/layout-container';
import { PanelModel } from './layout/panel';
import { DebugToolbarModel } from './debug-toolbar';

export class WorkspaceModel {
  /** Most recently active page-set. */
  @observable
  activePageSet: PageSetModel = null;
  /** Observable hooked up to window.resize event. */
  @observable
  windowDidResizeStream: Observable<void> = null;

  mainPageSet: PageSetModel = null;
  rootLayoutContainer: LayoutContainerModel;

  createDefaultLayout(): void {
    this.rootLayoutContainer = new LayoutContainerModel({
      id: 'root-layout', direction: 'vertical', windowDidResizeStream: this.windowDidResizeStream
    });
    const mainLayoutContainer = new LayoutContainerModel({
      id: 'main-container', direction: 'horizontal'
    });
    const leftLayoutContainer = new LayoutContainerModel({
      id: 'left-container', direction: 'vertical', width: '300px', resizable: true
    });
    const rightLayoutContainer = new LayoutContainerModel({
      id: 'right-container', direction: 'vertical', resizable: true
    });
    mainLayoutContainer.add(leftLayoutContainer, rightLayoutContainer);

    const openPagesPanel = new PanelModel({
      id: 'open-pages-panel', title: 'Open Pages', height: '300px', resizable: true, showHeader: true
    });
    leftLayoutContainer.add(
      openPagesPanel,
      new PanelModel({ id: 'dir-tree-panel', title: 'Explorer', resizable: true, showHeader: true })
    );

    const pageSetPanel = new PanelModel({ id: 'page-set-panel' });
    this.mainPageSet = new PageSetModel({ id: 'main-page-set', height: '100%' });
    pageSetPanel.add(this.mainPageSet);
    const pageTree = new PageTreeModel({ id: 'page-tree', height: '100%' });
    pageTree.pageSet = this.mainPageSet;
    openPagesPanel.add(pageTree);

    rightLayoutContainer.add(
      pageSetPanel,
      new PanelModel( { id: 'status-panel', height: '20px' })
    );

    const toolbarPanel = new PanelModel({ id: 'toolbar-panel', height: '48px' });
    const debugToolbar = new DebugToolbarModel({ id: 'debug-toolbar' });
    toolbarPanel.add(debugToolbar);

    this.rootLayoutContainer.add(
      toolbarPanel,
      mainLayoutContainer
    );

    this.activePageSet = this.mainPageSet;
  }
}
