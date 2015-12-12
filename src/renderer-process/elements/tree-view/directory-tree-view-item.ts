// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { RendererContext } from '../../renderer-context';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import { ITree, ITreeItem } from './tree-view';

interface ILocalDOM {
  indent: HTMLElement;
  expander: PolymerElements.PaperIconButton;
  folder: PolymerElements.PaperIconButton;
}

export type IDirectoryTreeViewItemElement = DirectoryTreeViewItemElement;

@pd.is('hydragon-directory-tree-view-item')
@pd.hostAttributes({ 'tabindex': '0' })
@pd.observers(['_observeExpanded(item.expanded)'])
export class DirectoryTreeViewItemElement extends Polymer.BaseClass<ILocalDOM>() {
  @pd.property({ type: Object })
  item: ITreeItem;
  @pd.property({ type: Number, value: 0, observer: '_observeIndent' })
  indent: number;

  static createSync(): IDirectoryTreeViewItemElement {
    return RendererContext.get().elementFactory.createElementSync<IDirectoryTreeViewItemElement>(
      (<any> DirectoryTreeViewItemElement.prototype).is
    );
  }

  @pd.listener('tap')
  private _onTap(e: MouseEvent): void {
    e.stopPropagation();
    if (this.item.expanded) {
      this.fire('tree-view-item-collapse');
    } else if (this.item.expandable) {
      this.fire('tree-view-item-expand');
    }
  }

  private _observeExpanded(expanded: boolean): void {
    const _ = this.$;
    if (expanded) {
      _.expander.style.transform = 'rotate(90deg)';
      _.expander.setAttribute('alt', 'Collapse');
      //_.folder.icon = 'icons:folder-open';
    } else {
      _.expander.style.transform = '';
      _.expander.setAttribute('alt', 'Expand');
      //_.folder.icon = 'icons:folder';
    }
  }

  private _observeIndent(newIndent: number, oldIndent: number): void {
    this.$.indent.style.flexBasis = `${newIndent}px`;
  }
}

export function register(): typeof DirectoryTreeViewItemElement {
  return Polymer<typeof DirectoryTreeViewItemElement>(DirectoryTreeViewItemElement.prototype);
}
