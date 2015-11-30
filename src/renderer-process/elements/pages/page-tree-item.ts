// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { ILayoutContainer } from '../interfaces';
import { RendererContext } from '../../renderer-context';
import { IPageSetElement } from './page-set';
import { IPageElement } from './page';
import { EventSubscription, EventEmitter } from '../../../common/events';

interface ILocalDOM {
  closeButton: PolymerElements.PaperIconButton;
}

function self(element: PageTreeItemElement): IPageTreeItemElement {
  return <IPageTreeItemElement> element;
}

function $(element: PageTreeItemElement): ILocalDOM {
  return <ILocalDOM> this;
}

const STYLE_CLASS_SELECTED = 'selected';

enum EventId {
  DidTap
}

export type IPageTreeItemElement = PageTreeItemElement & polymer.Base;

@pd.is('debug-workbench-page-tree-item')
export class PageTreeItemElement {
  private _emitter: EventEmitter<EventId>;
  private _page: IPageElement;

  @pd.property({ type: String, value: '' })
  title: string;

  get page(): IPageElement {
    return this._page;
  }

  static createSync(page: IPageElement): IPageTreeItemElement {
    return RendererContext.get().elementFactory.createElementSync<IPageTreeItemElement>(
      (<any> PageTreeItemElement.prototype).is, page
    );
  }

  created(): void {
    this._emitter = new EventEmitter<EventId>();
  }

  factoryImpl(page: IPageElement): void {
    this._page = page;
    this.title = page.title;
  }

  destroyed(): void {
    this._emitter.destroy();
    this._emitter = null;
    this._page = null;
  }

  select(isSelected?: boolean): void {
    self(this).toggleClass(STYLE_CLASS_SELECTED, isSelected);
  }

  onDidTap(handler: (event: MouseEvent) => void): EventSubscription {
    return this._emitter.on(EventId.DidTap, handler);
  }

  @pd.listener('tap')
  private _onClick(event: MouseEvent): void {
    this._emitter.emit(EventId.DidTap, event);
  }

  @pd.listener('closeButton.tap')
  private _onCloseButtonPressed(event: CustomEvent): void {
    event.stopImmediatePropagation();
    this._page.close();
  }
}

export function register(): typeof PageTreeItemElement {
  return Polymer<typeof PageTreeItemElement>(PageTreeItemElement.prototype);
}
