// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import * as CodeMirror from 'codemirror';
import 'codemirror/addon/scroll/simplescrollbars';
// TODO: maybe lazy load this as needed, consider using CodeMirror.requireMode()
// register modes for C, C++, Java and such
import 'codemirror/mode/clike/clike';

CodeMirror.defaults.lineNumbers = true;
CodeMirror.defaults.inputStyle = 'contenteditable';
CodeMirror.defaults.scrollbarStyle = 'simple';

export type IBehaviors = typeof Polymer.IronResizableBehavior;
export type ICodeMirrorEditorElement = CodeMirrorEditorElement & IBehaviors;

@pd.is('code-mirror-editor')
@pd.behaviors(() => [Polymer.IronResizableBehavior])
export default class CodeMirrorEditorElement extends Polymer.BaseClass<any, IBehaviors>() {
  private _editor: CodeMirror.Editor;

  @pd.property({ type: Object, observer: '_onConfigChanged' })
  config: CodeMirror.EditorConfiguration;

  get editor(): CodeMirror.Editor {
    return this._editor;
  }

  factoryImpl(config?: CodeMirror.EditorConfiguration): void {
    this.config = config;
  }

  attached(): void {
    this._editor = CodeMirror(
      (editorElement) => { Polymer.dom(this.root).appendChild(editorElement); },
      this.config
    );
  }

  private _onConfigChanged(newConfig: CodeMirror.EditorConfiguration, oldConfig: CodeMirror.EditorConfiguration) {
    // TODO: this needs to handle all possible options in EditorConfiguration
    if (this.editor) {
      if (newConfig.mode) {
        this.editor.setOption('mode', newConfig.mode);
      }
      const value = newConfig.value;
      if (value) {
        if (typeof value === 'string') {
          this.editor.getDoc().setValue(value);
        } else {
          this.editor.swapDoc(value);
        }
      }
    }
  }

  @pd.listener('iron-resize')
  private _onIronResize(): void {
    if (this._editor) {
      const newWidth = this.clientWidth;
      const newHeight = this.clientHeight;
      // don't bother resizing the editor if it's not going to be visible
      if ((newWidth !== 0) && (newHeight !== 0)) {
        this._editor.setSize(newWidth, newHeight);
        // force a refresh so the gutters are drawn correctly
        this._editor.refresh();
      }
    }
  }
}
