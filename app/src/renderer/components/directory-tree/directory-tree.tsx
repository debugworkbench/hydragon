// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import * as mobxReact from 'mobx-react';
import { AutoSizer, VirtualScroll } from 'react-virtualized';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import { DirectoryTreeModel, DirectoryTreeItemModel } from './directory-tree-model';
import { DirectoryTreeItemComponent } from './directory-tree-item';
import { stylable, themable } from '../decorators';
import { ContextComponent } from '../context';

// These components have to be transformed into observers in order for re-rendering to work
// when the tree changes
const AutoSizerComponent = mobxReact.observer(AutoSizer);
const VirtualScrollComponent = mobxReact.observer(VirtualScroll);

/**
 * React component that displays the contents of one or more directories.
 */
@stylable
@themable
@mobxReact.observer
export class DirectoryTreeComponent
       extends ContextComponent<
         DirectoryTreeComponent.IProps, void, DirectoryTreeComponent.IContext> {

  private _styleId: string;
  private _className: string;

  constructor() {
    super();
    this._onExpandItem = this._onExpandItem.bind(this);
    this._onCollapseItem = this._onCollapseItem.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._renderItems = this._renderItems.bind(this);
    this._renderRow = this._renderRow.bind(this);
  }

  componentWillMount(): void {
    const theme = this.context.theme;
    this._styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      outline: 'none',
      position: 'relative',
      height: '100%',
      backgroundColor: theme.primaryBackgroundColor,
      color: theme.primaryTextColor
    });
    this._className = `hydragon-dir-tree ${this._styleId}`;
  }

  private _onExpandItem(item: DirectoryTreeItemModel): void {
    this.props.model.expandItem(item);
  }

  private _onCollapseItem(item: DirectoryTreeItemModel): void {
    this.props.model.collapseItem(item);
  }

  private _onContextMenu(event: React.MouseEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    this.props.model.showContextMenu();
  }

  render() {
    return (
      <div className={this._className} onContextMenu={this._onContextMenu}>
        <AutoSizerComponent>{this._renderItems}</AutoSizerComponent>
        {/* The not so smart "render all the things!" approach:
          this.props.model.items.map(item => {
          const indent = `${this.props.model.computeItemIndent(item)}px`;
          return <DirectoryTreeItemComponent
            model={item}
            indent={indent}
            onExpand={this._onExpandItem}
            onCollapse={this._onCollapseItem} />
        })*/}
      </div>
    );
  }

  private _renderItems({ width, height }: { width: number; height: number }) {
    return (
      <VirtualScrollComponent
        width={width}
        height={height}
        rowCount={this.props.model.items.length}
        rowHeight={30}
        rowRenderer={this._renderRow} />
    );
  }

  private _renderRow({ index, isScrolling }: { index: number; isScrolling: boolean }) {
    const model = this.props.model.items[index];
    const indent = `${this.props.model.computeItemIndent(model)}px`;
    return (
      <DirectoryTreeItemComponent
        key={model.id}
        model={model}
        indent={indent}
        onExpand={this._onExpandItem}
        onCollapse={this._onCollapseItem} />
    );
  }
}

export namespace DirectoryTreeComponent {
  export interface IProps {
    model: DirectoryTreeModel;
  }

  export type IContext = stylable.IContext & themable.IContext;
}
