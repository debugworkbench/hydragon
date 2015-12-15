// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { IPageSetElement } from './page-set';
import { IPageElement } from './page';
import { IPageTreeItemElement } from './page-tree-item';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import ElementFactory from '../element-factory';

export interface IPageTreeState {
  width?: string;
  height?: string;
}

export type IBehaviors = typeof Polymer.IronControlState;
export type IPageTreeElement = PageTreeElement & IBehaviors;

@pd.is('debug-workbench-page-tree')
@pd.behaviors(() => [Polymer.IronControlState])
@pd.hostAttributes({ 'tabindex': '0' })
export default class PageTreeElement extends Polymer.BaseClass<any, IBehaviors>() {
  private _subscriptions: EventSubscriptionSet;
  private _itemSubscriptions: WeakMap<IPageTreeItemElement, EventSubscription>;
  private _pageSet: IPageSetElement;
  private _pageItemMap: Map<IPageElement, IPageTreeItemElement>;
  private _selectedItem: IPageTreeItemElement;
  private _boundOnDidClickItem: (event: MouseEvent) => void;
  private _elementFactory: ElementFactory;

  set pageSet(pageSet: IPageSetElement) {
    this._subscriptions.clear();
    this._pageSet = pageSet;
    this._subscriptions.add(pageSet.onDidAddPage(this._onPageSetDidAddPage.bind(this)));
    this._subscriptions.add(pageSet.onDidRemovePage(this._onPageSetDidRemovePage.bind(this)));
    this._subscriptions.add(pageSet.onDidActivatePage(this._onPageSetDidActivatePage.bind(this)));
  }

  created(): void {
    this._subscriptions = new EventSubscriptionSet();
    this._itemSubscriptions = new WeakMap();
    this._pageItemMap = new Map();
    this._boundOnDidClickItem = this._onDidClickItem.bind(this);
  }

  factoryImpl(elementFactory: ElementFactory, state?: IPageTreeState): void {
    this._elementFactory = elementFactory;
    if (state) {
      if (state.width !== undefined) {
        this.style.width = state.width;
      }
      if (state.height !== undefined) {
        this.style.height = state.height;
      }
    }
  }

  destroyed(): void {
    this._subscriptions.destroy();
    this._subscriptions = null;
    for (const item of this._pageItemMap.values()) {
      this._itemSubscriptions.get(item).destroy();
      this._itemSubscriptions.delete(item);
      item.destroyed();
    }
    this._pageItemMap.clear();
    this._pageItemMap = null;
    this._itemSubscriptions = null;
    this._boundOnDidClickItem = null;
  }

  private _onPageSetDidAddPage(page: IPageElement): void {
    const item = this._elementFactory.createPageTreeItem(page);
    this._itemSubscriptions.set(item, item.onDidTap(this._boundOnDidClickItem));
    this._pageItemMap.set(page, item);
    // TODO: figure out the sort order and set the order CSS property on the item so flexbox
    //       can take care of the rest
    Polymer.dom(this).appendChild(item);
  }

  private _onPageSetDidRemovePage(page: IPageElement): void {
    const item = this._pageItemMap.get(page);
    this._itemSubscriptions.get(item).destroy();
    this._itemSubscriptions.delete(item)
    this._pageItemMap.delete(page);
    Polymer.dom(this).removeChild(item);
    item.destroyed();
  }

  private _onPageSetDidActivatePage(page: IPageElement): void {
    const item = this._pageItemMap.get(page);
    this._selectItem(item);
  }

  private _onDidClickItem(event: MouseEvent): void {
    const item = <IPageTreeItemElement> Polymer.dom(event).localTarget;
    this._pageSet.activatePage(item.page);
  }

  private _selectItem(item: IPageTreeItemElement): void {
    if (this._selectedItem) {
      this._selectedItem.select(false);
    }
    item.select(true);
    this._selectedItem = item;
  }
}

export function register(): typeof PageTreeElement {
  return Polymer<typeof PageTreeElement>(PageTreeElement.prototype);
}
