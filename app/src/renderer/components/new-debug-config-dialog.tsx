// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { autorun, Lambda } from 'mobx';
import { NewDebugConfigDialogModel } from '../models/ui';
import { PaperDropdownMenuComponent } from './paper/paper-dropdown-menu';

/**
 * Currently this component is just a simple wrapper for a custom element.
 */
@observer
export class NewDebugConfigDialogComponent extends React.Component<NewDebugConfigDialogComponent.IProps, {}, {}> {
  private configNameInput: PolymerElements.PaperInput;
  private engineDropdown: PaperDropdownMenuComponent;
  private dialog: PolymerElements.PaperDialog;
  private disposeAutorun: Lambda;

  private onSetConfigNameInputRef = (ref: PolymerElements.PaperInput) => this.configNameInput = ref;
  private onSetEngineDropdownRef = (ref: PaperDropdownMenuComponent) => this.engineDropdown = ref;

  private onSetDialogRef = (ref: PolymerElements.PaperDialog) => {
    this.dialog = ref;
    this.syncState();
  }

  private onDidConfirm = (): void => {
    this.props.model.onDidConfirm({
      debugEngineId: this.engineDropdown.selectedItemLabel,
      debugConfigName: this.configNameInput.value
    });
  }

  private onDidCancel = (): void => {
    this.props.model.onDidCancel();
  }

  /** Synchronize state between the model and the custom element. */
  private syncState(): void {
    if (this.dialog && (this.props.model.isOpen !== this.dialog.opened)) {
      this.props.model.isOpen ? this.dialog.open() : this.dialog.close();
    }
  }

  componentDidMount(): void {
    this.disposeAutorun = autorun(this.syncState, this);
  }

  componentWillUnmount(): void {
    if (this.disposeAutorun) {
      this.disposeAutorun();
    }
  }

  render() {
    return (
      <paper-dialog ref={this.onSetDialogRef} id="dialog" modal>
        <h2>New Debug Configuration</h2>
        <div>
          <paper-input id="configName" label="Name" ref={this.onSetConfigNameInputRef}></paper-input>
          <PaperDropdownMenuComponent ref={this.onSetEngineDropdownRef} id="engines" label="Engine">
            <paper-menu class="dropdown-content">
              <paper-item>gdb-mi</paper-item>
            </paper-menu>
          </PaperDropdownMenuComponent>
        </div>
        <div className="buttons">
          <paper-button dialog-dismiss onClick={this.onDidCancel}>Cancel</paper-button>
          <paper-button dialog-confirm onClick={this.onDidConfirm}>OK</paper-button>
        </div>
      </paper-dialog>
    );
  }
}

namespace NewDebugConfigDialogComponent {
  export interface IProps extends React.Props<NewDebugConfigDialogComponent> {
    model: NewDebugConfigDialogModel;
  }
}