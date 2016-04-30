// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { FreeStyle } from 'react-free-style';
import { PageModel } from '../../models/ui';
import { IronFlexLayout, PaperStyles } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, IStylableContext } from '../stylable';

export interface IProps extends React.Props<PageTreeItemComponent> {
  width?: string;
  height?: string;
  model?: PageModel;
  isSelected?: boolean;
  onDidClick: (item: PageTreeItemComponent) => void;
}

interface IContext extends IStylableContext {
}

const STYLE_CLASS_SELECTED = 'selected';

/**
 * Component that displays the titles of the pages from a page-set in a tree view.
 */
@stylable
export class PageTreeItemComponent extends React.Component<IProps, {}, IContext> {
  styleId: string;
  className: string;

  onDidClick = (e: React.SyntheticEvent) => this.props.onDidClick(this);
  onDidClose = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    this.props.model.close();
  };

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative'
      },
      IronFlexLayout.horizontal,
      IronFlexLayout.center,
      {
        '> .title': Object.assign(
          PaperStyles.PaperFont.Common.Base, /* @apply(--paper-font-common-base) */
          {
            paddingLeft: '8px',
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          },
          IronFlexLayout.flex.auto
        )
      }
    ));
    this.className = `hydragon-page-tree-item ${this.styleId}`;
  }

  render() {
    let className = this.className;
    if (this.props.isSelected) {
      className += ` ${STYLE_CLASS_SELECTED}`;
    }
    return (
      <div className={className} onClick={this.onDidClick}>
        <div className="title">{this.props.model.title}</div>
        <paper-icon-button ref={onDidSetCloseButtonRef} icon="icons:close" alt="Close Page"
          onClick={this.onDidClose}>
        </paper-icon-button>
      </div>
    );
  }
}

function onDidSetCloseButtonRef(element: PolymerElements.PaperIconButton): void {
  if (element) {
    setImmediate(() => updatePolymerCSSVars(element, Object.assign(
      {
        '--paper-icon-button': {
          width: '30px',
          height: '30px',
          padding: '5px'
        },
      },
      IronFlexLayout.flex.none
    )));
  }
}