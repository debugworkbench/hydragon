// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { GdbMiDebugConfigPageModel } from '../../models/ui';
import { IronFlexLayout } from '../styles';
import { PageComponent } from './page';
import {
  PaperDropdownMenuComponent, PaperMenuComponent, PaperCheckboxComponent, PaperInputComponent,
  PaperButtonComponent
} from '../paper';
import { FileInputComponent } from '../file-input';
import { stylable } from '../decorators';

/**
 * Page component that displays a debug configuration form.
 */
@stylable
@observer
export class GdbMiDebugConfigPageComponent
       extends React.Component<
                 GdbMiDebugConfigPageComponent.IProps, {}, GdbMiDebugConfigPageComponent.IContext> {

  private styleId: string;
  private className: string;

  private onDidTapSaveButton = () => this.props.model.save();
  private onDidChangeTargetExeArgs = (newValue: string) => this.props.model.executableArgs = newValue;
  private onDidChangeDebuggerHost = (newValue: string) => this.props.model.host = newValue;
  private onDidChangeDebuggerPort = (newValue: string) => this.props.model.port = Number(newValue);

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle(Object.assign(
      {
        boxSizing: 'border-box',
        position: 'relative',
        outline: 'none',
      },
      IronFlexLayout.vertical
    ));
    this.className = `hydragon-gdb-mi-debug-config-page ${this.styleId}`;
  }

  render() {
    const model = this.props.model;
    return (
      <PageComponent model={model} className={this.className}>
        <PaperDropdownMenuComponent label="Debugger Type">
          <PaperMenuComponent className="dropdown-content">
            <paper-item>GDB</paper-item>
            <paper-item>LLDB</paper-item>
          </PaperMenuComponent>
        </PaperDropdownMenuComponent>
        <FileInputComponent label="Debugger Path" model={model.debuggerPath} />
        <FileInputComponent label="Executable" model={model.executable} />
        <PaperInputComponent label="Arguments" value={model.executableArgs} onDidChange={this.onDidChangeTargetExeArgs} />

        <PaperCheckboxComponent checked={model.targetIsRemote}>Remote Target</PaperCheckboxComponent>
        <PaperInputComponent label="Host" value={model.host} onDidChange={this.onDidChangeDebuggerHost} />
        <PaperInputComponent label="Port" value={`${model.port}`}
          type="number" min={0} max={65535} step={1}
          onDidChange={this.onDidChangeDebuggerPort} />
        <PaperButtonComponent onDidTap={this.onDidTapSaveButton}>Save</PaperButtonComponent>
      </PageComponent>
    );
  }
}

namespace GdbMiDebugConfigPageComponent {
  export interface IProps extends React.Props<GdbMiDebugConfigPageComponent> {
    model: GdbMiDebugConfigPageModel;
  }

  export interface IContext extends stylable.IContext {
  }
}
