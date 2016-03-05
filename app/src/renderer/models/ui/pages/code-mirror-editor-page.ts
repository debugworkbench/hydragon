// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import PageModel from './page';
import CodeMirrorEditorPageComponent from '../../../components/pages/code-mirror-editor-page';

export default class CodeMirrorEditorPageModel extends PageModel<typeof CodeMirrorEditorPageComponent> {
  editorConfig: CodeMirror.EditorConfiguration;

  ComponentClass = CodeMirrorEditorPageComponent;
}
