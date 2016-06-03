// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { EventSubscription, EventSubscriptionSet } from '../../../common/events';
import { DirectoryTreeItemModel } from './directory-tree-model';
import { stylable } from '../decorators';
import { IronFlexLayout } from '../styles';
import { PaperIconButtonComponent } from '../paper';

/**
 * React component that represents a directory entry in a [[DirectoryTreeComponent]].
 */
@stylable
export class DirectoryTreeItemComponent
       extends React.Component<DirectoryTreeItemComponent.IProps, {}, stylable.IContext> {

  private _styleId: string;
  private _className: string;

  constructor() {
    super();
    this._onClick = this._onClick.bind(this);
  }

  componentWillMount(): void {
    this._styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        outline: 'none',
        overflow: 'hidden'
      },
      IronFlexLayout.horizontal,
      IronFlexLayout.center,
      {
        '> .indent': IronFlexLayout.flex.none,
        '> .buttons': Object.assign({},
          IronFlexLayout.flex.none,
          IronFlexLayout.horizontal
        ),
        '> .buttons.expander': IronFlexLayout.flex.none,
        '> .title': {
          cursor: 'pointer',
          '-webkit-user-select': 'none',
          flex: '1 0 auto'
        }
      }
    ));
    this._className = `hydragon-dir-tree-item ${this._styleId}`;
  }

  private _onClick(e: React.MouseEvent): void {
    const model = this.props.model;
    model.isExpanded ? this.props.onCollapse(model) : this.props.onExpand(model);
  }

  render() {
    const { model, indent, onExpand, onCollapse } = this.props;

    return <div className={this._className} tabIndex="0" onClick={this._onClick}>
      <span className="indent" style={{ flexBasis: indent }}></span>
      <div className="buttons" hidden={!model.isExpandable}>
        <PaperIconButtonComponent className="expander"
          icon="icons:chevron-right"
          alt={model.isExpanded ? 'Collapse' : 'Expand'}
          style={{ transform: model.isExpanded ? 'rotate(90deg)' : '' }}
          cssVars={{
            '--paper-icon-button': {
              width: '30px',
              height: '30px',
              padding: '5px'
            }
          }}
        />
      </div>
      <span className="title">{model.title}</span>
    </div>
  }
}

export namespace DirectoryTreeItemComponent {
  export interface IProps {
    model: DirectoryTreeItemModel;
    /** Amount to indent the item by, must be a valid CSS value such as '10px'. */
    indent: string;
    /** Callback to invoke when the item is expanded. */
    onExpand: (item: DirectoryTreeItemModel) => void;
    /** Callback to invoke when the item is collapsed. */
    onCollapse: (item: DirectoryTreeItemModel) => void;
  }
}
