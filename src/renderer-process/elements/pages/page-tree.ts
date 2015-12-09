// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { IPageSetElement } from './page-set';
import { IPageElement } from './page';
import { PageTreeItemElement, IPageTreeItemElement } from './page-tree-item';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';

function self(element: PageTreeElement): IPageTreeElement {
  return <any> element;
}

export interface IPageTreeState {
  width?: string;
  height?: string;
}

export type IPageTreeElement = PageTreeElement & polymer.Base;

@pd.is('debug-workbench-page-tree')
@pd.behavior(Polymer.IronControlState)
@pd.hostAttributes({ 'tabindex': '0' })
export class PageTreeElement {
  private _subscriptions: EventSubscriptionSet;
  private _itemSubscriptions: WeakMap<IPageTreeItemElement, EventSubscription>;
  private _pageSet: IPageSetElement;
  private _pageItemMap: Map<IPageElement, IPageTreeItemElement>;
  private _selectedItem: IPageTreeItemElement;
  private _boundOnDidClickItem: (event: MouseEvent) => void;

  set pageSet(pageSet: IPageSetElement) {
    this._subscriptions.clear();
    this._pageSet = pageSet;
    this._subscriptions.add(pageSet.onDidAddPage(this._onPageSetDidAddPage.bind(this)));
    this._subscriptions.add(pageSet.onDidRemovePage(this._onPageSetDidRemovePage.bind(this)));
    this._subscriptions.add(pageSet.onDidActivatePage(this._onPageSetDidActivatePage.bind(this)));
  }

  static createSync(state?: IPageTreeState): IPageTreeElement {
    return RendererContext.get().elementFactory.createElementSync<IPageTreeElement>(
      (<any> PageTreeElement.prototype).is, state
    );
  }

  created(): void {
    this._subscriptions = new EventSubscriptionSet();
    this._itemSubscriptions = new WeakMap();
    this._pageItemMap = new Map();
    this._boundOnDidClickItem = this._onDidClickItem.bind(this);
  }

  factoryImpl(state?: IPageTreeState): void {
    if (state) {
      if (state.width !== undefined) {
        self(this).style.width = state.width;
      }
      if (state.height !== undefined) {
        self(this).style.height = state.height;
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
    const item = PageTreeItemElement.createSync(page);
    this._itemSubscriptions.set(item, item.onDidTap(this._boundOnDidClickItem));
    this._pageItemMap.set(page, item);
    // TODO: figure out the sort order and set the order CSS property on the item so flexbox
    //       can take care of the rest
    Polymer.dom(<any> this).appendChild(item);
  }

  private _onPageSetDidRemovePage(page: IPageElement): void {
    const item = this._pageItemMap.get(page);
    this._itemSubscriptions.get(item).destroy();
    this._itemSubscriptions.delete(item)
    this._pageItemMap.delete(page);
    Polymer.dom(<any> this).removeChild(item);
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