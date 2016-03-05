// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { FreeStyle } from 'react-free-style';
import { PageModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import PageComponent from './page';

export interface IProps extends React.Props<GdbMiDebugConfigPageComponent> {
  model: PageModel<any>;
}

interface IContext {
  freeStyle: FreeStyle.FreeStyle;
}

/**
 * Page component that displays a debug configuration form.
 */
export default class GdbMiDebugConfigPageComponent extends React.Component<IProps, {}, IContext> {
  styleId: string;
  className: string;

  static contextTypes: React.ValidationMap<IContext> = {
    freeStyle: React.PropTypes.object.isRequired
  };

  private onDidClickClose = (e: React.MouseEvent) => this.props.model.close();

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        outline: 'none',
      },
      IronFlexLayout.vertical,
      {
        '> paper-toolbar': Object.assign(
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
        ),
        '> paper-toolbar > .closeButton': {
          '--paper-icon-button': {
            width: '30px',
            height: '30px',
            padding: '5px'
          }
        },
        '> .contentWrapper': Object.assign(
          { position: 'relative' },
          IronFlexLayout.flex.auto
        )
      }
    ));
    this.className = `hydragon-gdb-mi-debug-config-page ${this.styleId}`;
  }

  render() {
    return (
      <PageComponent model={this.props.model} className={this.className}>
      {/*
        <paper-dropdown-menu label="Debugger Type">
          <paper-menu id="debuggerTypes" class="dropdown-content">
            <paper-item>GDB</paper-item>
            <paper-item>LLDB</paper-item>
          </paper-menu>
        </paper-dropdown-menu>
        <file-input input-label="Debugger Path" file-path="{{debugConfig.debuggerPath}}"></file-input>
        <file-input input-label="Executable" file-path="{{debugConfig.executable}}"></file-input>
        <paper-input label="Arguments" value="{{debugConfig.executableArgs}}"></paper-input>
        */}
        <label htmlFor="isRemote">Remote Target</label>
        {/*
        <paper-toggle-button id="isRemote" checked="{{debugConfig.targetIsRemote}}"></paper-toggle-button>
        <paper-input label="Host" value="{{debugConfig.host}}"></paper-input>
        <paper-input label="Port" value="{{debugConfig.port}}"></paper-input>
        <paper-button id="saveButton">Save</paper-button>
        */}
      </PageComponent>
    );
  }
}
