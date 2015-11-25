// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import * as CodeMirror from 'codemirror';
import { RendererContext } from '../../renderer-context';
import 'codemirror/addon/scroll/simplescrollbars';
// TODO: maybe lazy load this as needed, consider using CodeMirror.requireMode()
// register modes for C, C++, Java and such
import 'codemirror/mode/clike/clike';

CodeMirror.defaults.lineNumbers = true;
CodeMirror.defaults.inputStyle = 'contenteditable';
CodeMirror.defaults.scrollbarStyle = 'simple';

function self(element: CodeMirrorEditorElement): ICodeMirrorEditorElement {
  return <any> element;
}

export type ICodeMirrorEditorElement = CodeMirrorEditorElement & polymer.Base;

@pd.is('code-mirror-editor')
@pd.behavior(Polymer.IronResizableBehavior)
export class CodeMirrorEditorElement {
  private _editorConfig: CodeMirror.EditorConfiguration;
  private _editor: CodeMirror.Editor;

  get editor(): CodeMirror.Editor {
    return this._editor;
  }

  static createSync(config?: CodeMirror.EditorConfiguration): ICodeMirrorEditorElement {
    return RendererContext.get().elementFactory.createElementSync<ICodeMirrorEditorElement>(
      (<any> CodeMirrorEditorElement.prototype).is, config
    );
  }

  factoryImpl(config?: CodeMirror.EditorConfiguration): void {
    this._editorConfig = config;
  }

  attached(): void {
    this._editor = CodeMirror(
      (editorElement) => { Polymer.dom(self(this).root).appendChild(editorElement); },
      this._editorConfig
    );
  }

  @pd.listener('iron-resize')
  private _onIronResize(): void {
    if (this._editor) {
      const newWidth = self(this).clientWidth;
      const newHeight = self(this).clientHeight;
      // don't bother resizing the editor if it's not going to be visible
      if ((newWidth !== 0) && (newHeight !== 0)) {
        this._editor.setSize(newWidth, newHeight);
        // force a refresh so the gutters are drawn correctly
        this._editor.refresh();
      }
    }
  }
}

export function register(): typeof CodeMirrorEditorElement {
  return Polymer<typeof CodeMirrorEditorElement>(CodeMirrorEditorElement.prototype);
}
