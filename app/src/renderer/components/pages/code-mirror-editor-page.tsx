// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as React from 'react';
import { Observable, Subscription } from '@reactivex/rxjs';
import { FreeStyle } from 'react-free-style';
import { CodeMirrorEditorPageModel } from './code-mirror-editor-page-model';
import { IronFlexLayout } from '../styles';
import { PageComponent } from './page';
import { ICodeMirrorEditorElement } from '../../elements/code-mirror-editor/code-mirror-editor';
import { stylable } from '../decorators';

/**
 * Page component that contains a Code Mirror editor element.
 */
@stylable
export class CodeMirrorEditorPageComponent
       extends React.Component<CodeMirrorEditorPageComponent.IProps, {}, CodeMirrorEditorPageComponent.IContext> {

  styleId: string;
  className: string;

  private editorElement: ICodeMirrorEditorElement;
  private didResizeStreamSub: Subscription;

  private onSetCodeMirrorEditorRef = (element: ICodeMirrorEditorElement) => {
    this.editorElement = element;
    // Force the editor element to rerender itself after it's attached to the DOM.
    // setImmediate() is used here to delay the operation a little bit in order to
    // allow Polymer to update the state of the element after it's attached to the DOM.
    setImmediate(() => {
      if (this.editorElement) {
        this.editorElement.notifyResize();
      }
    });
  }

  componentWillMount(): void {
    this.styleId = this.context.freeStyle.registerStyle({
      'code-mirror-editor': IronFlexLayout.fit
    });
    this.className = `hydragon-code-mirror-editor-page ${this.styleId}`;
  }

  componentDidMount(): void {
    // The editor element needs to know the actual width/height of its container in order to render
    // itself correctly. So, any time the container changes size (for example because the browser
    // window was resized) the editor element needs to be notified so it can rerender itself to fit
    // the new container dimensions.
    this.didResizeStreamSub = this.props.model.didResizeStream.subscribe(() => {
      if (this.editorElement) {
        this.editorElement.notifyResize();
      }
    });
  }

  shouldComponentUpdate(nextProps: CodeMirrorEditorPageComponent.IProps): boolean {
    return nextProps.model !== this.props.model;
  }

  componentDidUpdate(prevProps: CodeMirrorEditorPageComponent.IProps): void {
    this.editorElement.config = this.props.model.editorConfig;
  }

  componentWillUnmount(): void {
    this.didResizeStreamSub.unsubscribe();
  }

  render() {
    return (
      <PageComponent model={this.props.model} className={this.className}>
        <code-mirror-editor ref={this.onSetCodeMirrorEditorRef}>
        </code-mirror-editor>
      </PageComponent>
    );
  }
}

export namespace CodeMirrorEditorPageComponent {
  export interface IProps extends React.Props<CodeMirrorEditorPageComponent> {
    model: CodeMirrorEditorPageModel;
  }

  export interface IContext extends stylable.IContext {
  }
}
