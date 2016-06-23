// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { autorun, Lambda } from 'mobx';
import { NewDebugConfigDialogModel } from './new-debug-config-dialog-model';
import {
  PaperDropdownMenuComponent, PaperMenuComponent, PaperDialogComponent, PaperInputComponent,
  PaperButtonComponent
} from '../paper';

/**
 * A simple dialog component that lets the user enter the name for a new debug config and select
 * the debug engine the new config will be used with.
 */
@observer
export class NewDebugConfigDialogComponent
       extends React.Component<NewDebugConfigDialogComponent.IProps, {}, {}> {

  private configNameInput: PaperInputComponent;
  private engineDropdown: PaperDropdownMenuComponent;

  private onSetConfigNameInputRef = (ref: PaperInputComponent) => this.configNameInput = ref;
  private onSetEngineDropdownRef = (ref: PaperDropdownMenuComponent) => this.engineDropdown = ref;

  private onDidConfirm = (): void => {
    this.props.model.onDidConfirm({
      debugEngineId: this.engineDropdown.selectedItemLabel,
      debugConfigName: this.configNameInput.value
    });
  }

  private onDidCancel = (): void => {
    this.props.model.onDidCancel();
  }

  render() {
    return (
      <PaperDialogComponent modal isOpen={this.props.model.isOpen}>
        <h2>New Debug Configuration</h2>
        <div>
          <PaperInputComponent label="Name" ref={this.onSetConfigNameInputRef} />
          <PaperDropdownMenuComponent ref={this.onSetEngineDropdownRef} label="Engine">
            <PaperMenuComponent className="dropdown-content">
              <paper-item>gdb-mi</paper-item>
            </PaperMenuComponent>
          </PaperDropdownMenuComponent>
        </div>
        <div className="buttons">
          <PaperButtonComponent dialog-dismiss onDidTap={this.onDidCancel}>
            Cancel
          </PaperButtonComponent>
          <PaperButtonComponent dialog-confirm onDidTap={this.onDidConfirm}>
            OK
          </PaperButtonComponent>
        </div>
      </PaperDialogComponent>
    );
  }
}

export namespace NewDebugConfigDialogComponent {
  export interface IProps extends React.Props<NewDebugConfigDialogComponent> {
    model: NewDebugConfigDialogModel;
  }
}
