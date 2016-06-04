// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { observer } from 'mobx-react';
import { IronFlexLayout } from '../styles';
import { stylable } from '../decorators';
import { PaperInputComponent, PaperButtonComponent } from '../paper';
import { FileInputModel } from './file-input-model';

/**
 * A component that consists of an input field containing a file/directory path and a button that
 * opens a native "open file/directory" dialog that allows the user to select a file or directory
 * on disk.
 */
@observer
@stylable
export class FileInputComponent
       extends React.Component<FileInputComponent.IProps, {}, FileInputComponent.IContext> {

  private styleId: string;

  private onDidChangeInput = (newValue: string) => this.props.model.path = newValue;
  private onDidTapBrowseButton = () => this.props.model.promptForFile();

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      display: 'block',
      boxSizing: 'border-box',
      outline: 'none'
    });
  }

  render() {
    const model = this.props.model;
    return (
      <PaperInputComponent className={this.styleId} label={this.props.label} value={model.path}
        onDidChange={this.onDidChangeInput}>
        <PaperButtonComponent suffix onDidTap={this.onDidTapBrowseButton}>
          Browse
        </PaperButtonComponent>
      </PaperInputComponent>
    );
  }
}

export namespace FileInputComponent {
  export interface IProps extends React.Props<FileInputComponent> {
    model: FileInputModel;
    label?: string;
  }

  export interface IContext extends stylable.IContext {
  }
}
