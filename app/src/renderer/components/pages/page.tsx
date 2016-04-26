// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { PageModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, IStylableContext } from '../stylable';

export interface IProps extends React.Props<PageComponent> {
  model: PageModel;
  className?: string;
}

interface IContext extends IStylableContext {
}

/**
 * Page component that displays some arbitrary content in a PageSet component.
 */
@observer
@stylable
export class PageComponent extends React.Component<IProps, {}, IContext> {
  styleId: string;
  className: string;

  private onDidClickClose = (e: React.MouseEvent) => this.props.model.close();

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        outline: 'none',
        width: '100%',
        height: '100%'
      },
      IronFlexLayout.vertical,
      {
        '> .contentWrapper': Object.assign(
          { position: 'relative' },
          IronFlexLayout.flex.auto
        )
      }
    ));
    this.className = `${this.props.className} ${this.styleId}`;
  }

  render() {
    return (
      <div className="hydragon-page">
        <div className={this.className}>
          <paper-toolbar ref={onDidSetToolbarRef}>
            <div className="title">{this.props.model.title}</div>
              <paper-icon-button ref={onDidSetCloseButtonRef} icon="icons:close" alt="Close Page"
                onClick={this.onDidClickClose}>
              </paper-icon-button>
          </paper-toolbar>
          <div className="contentWrapper">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

function onDidSetToolbarRef(element: PolymerElements.PaperToolbar): void {
  if (element) {
    // For some reason the Polymer element doesn't consider itself attached at this point, which
    // means it will ignore any attempt to update its style, delaying the operation a little bit
    // using `setImmediate` seems to work around the issue.
    setImmediate(() => updatePolymerCSSVars(element, Object.assign(
      {
        '--paper-toolbar-background': 'rgb(30, 30, 30)',
        '--paper-toolbar-color': 'rgb(204, 204, 204)',
        '--paper-toolbar-height': '30px',
        '--paper-toolbar-title': {
          'font-size': '14px',
          'margin-left': '10px'
        }
      },
      IronFlexLayout.flex.none
    )));
  }
}

function onDidSetCloseButtonRef(element: PolymerElements.PaperIconButton): void {
  if (element) {
    setImmediate(() => updatePolymerCSSVars(element, {
      '--paper-icon-button': {
        width: '30px',
        height: '30px',
        padding: '5px'
      }
    }));
  }
}
