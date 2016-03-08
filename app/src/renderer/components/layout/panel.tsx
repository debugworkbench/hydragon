// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { FreeStyle } from 'react-free-style';
import { IronFlexLayout } from '../styles';
import { updatePolymerCSSVars } from '../../elements/utils';
import { stylable, IStylableContext } from '../stylable';

export interface IProps extends React.Props<PanelComponent> {
  width?: string;
  height?: string;
  flex?: string;
  resizable?: boolean;
  title?: string;
  showHeader?: boolean;
}

interface IContext extends IStylableContext {
}

@stylable
export default class PanelComponent extends React.Component<IProps, {}, IContext> {
  inlineStyle: {
    width?: string;
    height?: string;
    flex?: string;
  } = {};

  styleId: string;
  className: string;

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      boxSizing: 'border-box',
      position: 'relative',
      display: 'block',
      backgroundColor: 'rgb(37, 37, 38)',
      '.content-wrapper': IronFlexLayout.fit
    });
    this.className = `hydragon-panel ${this.styleId}`;

    if (this.props.width !== undefined) {
        this.inlineStyle.width = this.props.width;
    }
    if (this.props.height !== undefined) {
      this.inlineStyle.height = this.props.height;
    }
    if (this.props.flex !== undefined) {
      this.inlineStyle.flex = this.props.flex;
    }
  }

  renderContent() {
    if (this.props.showHeader) {
      return (
        <paper-header-panel>
          <paper-toolbar ref={onDidChangePaperToolbarRef}>
            <div className="title">{this.props.title}</div>
          </paper-toolbar>
          {this.props.children}
        </paper-header-panel>
      );
    } else {
      return this.props.children;
    }
  }

  render() {
    return (
      <div className={this.className} style={this.inlineStyle}>
        <div className="content-wrapper">
        {this.renderContent()}
        </div>
      </div>
    );
  }
}

function onDidChangePaperToolbarRef(element: PolymerElements.PaperToolbar): void {
  if (element) {
    // For some reason the Polymer element doesn't consider itself attached at this point, which
    // means it will ignore any attempt to update its style, delaying the operation a little bit
    // using `setImmediate` seems to work around the issue.
    setImmediate(() => updatePolymerCSSVars(element, {
      '--paper-toolbar-background': 'rgb(56, 56, 56)',
      '--paper-toolbar-color': 'rgb(204, 204, 204)',
      '--paper-toolbar-height': '30px',
      '--paper-toolbar-title': {
        'font-size': '14px',
        'font-weight': 'bold',
        'text-transform': 'uppercase',
        'margin-left': '0'
      }
    }));
  }
}