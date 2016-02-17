// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import { PageBehavior, IPageElement } from '../pages/page-behavior';

export type ICodeMirrorEditorPageElement = IPageElement & CodeMirrorEditorPageElement;

@pd.is('hydragon-code-mirror-editor-page')
@pd.behaviors(PageBehavior)
export default class CodeMirrorEditorPageElement extends Polymer.BaseClass<any, IPageElement>() {
  @pd.property({ type: Object, notify: true })
  editorConfig: CodeMirror.EditorConfiguration;

  factoryImpl(title: string, config?: CodeMirror.EditorConfiguration): void {
    this.title = title;
    this.editorConfig = config || this.editorConfig;
  }
}
