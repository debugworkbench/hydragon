// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { autorun, Lambda } from 'mobx';
import { NewDebugConfigDialogModel } from '../models/ui';
import { PaperDropdownMenuComponent, PaperMenuComponent, PaperDialogComponent } from './paper';

/**
 * A simple dialog component that lets the user enter the name for a new debug config and select
 * the debug engine the new config will be used with.
 */
@observer
export class NewDebugConfigDialogComponent
       extends React.Component<NewDebugConfigDialogComponent.IProps, {}, {}> {

  private configNameInput: PolymerElements.PaperInput;
  private engineDropdown: PaperDropdownMenuComponent;

  private onSetConfigNameInputRef = (ref: PolymerElements.PaperInput) => this.configNameInput = ref;
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
          <paper-input label="Name" ref={this.onSetConfigNameInputRef}></paper-input>
          <PaperDropdownMenuComponent ref={this.onSetEngineDropdownRef} label="Engine">
            <PaperMenuComponent className="dropdown-content">
              <paper-item>gdb-mi</paper-item>
            </PaperMenuComponent>
          </PaperDropdownMenuComponent>
        </div>
        <div className="buttons">
          <paper-button dialog-dismiss onClick={this.onDidCancel}>Cancel</paper-button>
          <paper-button dialog-confirm onClick={this.onDidConfirm}>OK</paper-button>
        </div>
      </PaperDialogComponent>
    );
  }
}

namespace NewDebugConfigDialogComponent {
  export interface IProps extends React.Props<NewDebugConfigDialogComponent> {
    model: NewDebugConfigDialogModel;
  }
}