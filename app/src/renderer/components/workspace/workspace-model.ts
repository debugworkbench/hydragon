// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { observable } from 'mobx';
import { Subject, Observable } from '@reactivex/rxjs';
import { PageSetModel } from '../pages/page-set-model';
import { PageTreeModel } from '../pages/page-tree-model';
import { LayoutContainerModel } from '../layout/layout-container-model';
import { PanelModel } from '../layout/panel-model';
import { DebugToolbarModel } from '../toolbars/debug-toolbar-model';
import { DialogModel } from '../dialogs/dialog-model';
import { DebugConfigManager } from '../../debug-config-manager';
import { DebugConfigPresenter } from '../../debug-config-presenter';
import { DirectoryTreeModel } from '../directory-tree/directory-tree-model';

export class WorkspaceModel {
  /** Most recently active page-set. */
  @observable
  activePageSet: PageSetModel = null;
  /** Observable hooked up to window.resize event. */
  @observable
  windowDidResizeStream: Observable<void> = null;
  /** Currently active modal dialog (if any). */
  @observable
  modalDialog: DialogModel = null;

  mainPageSet: PageSetModel = null;
  rootLayoutContainer: LayoutContainerModel;

  createDefaultLayout({
    mainPageSet, pageTree, debugToolbar, dirTree
  }: WorkspaceModel.IDefaultLayoutParams): void {
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
    const dirTreePanel = new PanelModel({
      id: 'explorer-panel', title: 'Explorer', resizable: true, showHeader: true
    });
    leftLayoutContainer.add(
      openPagesPanel,
      dirTreePanel
    );

    const pageSetPanel = new PanelModel({ id: 'page-set-panel' });
    this.mainPageSet = mainPageSet;
    pageSetPanel.add(this.mainPageSet);
    pageTree.pageSet = this.mainPageSet;
    openPagesPanel.add(pageTree);
    dirTreePanel.add(dirTree);

    rightLayoutContainer.add(
      pageSetPanel,
      new PanelModel( { id: 'status-panel', height: '20px' })
    );

    const toolbarPanel = new PanelModel({ id: 'toolbar-panel', height: '48px' });
    toolbarPanel.add(debugToolbar);

    this.rootLayoutContainer.add(
      toolbarPanel,
      mainLayoutContainer
    );

    this.activePageSet = this.mainPageSet;
  }
}

export namespace WorkspaceModel {
  export interface IDefaultLayoutParams {
    mainPageSet: PageSetModel;
    pageTree: PageTreeModel;
    debugToolbar: DebugToolbarModel;
    dirTree: DirectoryTreeModel;
  }
}
