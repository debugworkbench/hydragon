// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as fs from 'fs-promisified';
import * as path from 'path';
import { PagePresenter } from './page-presenter';
import { RendererIPCDispatcher, IRendererDispatcherNode } from './ipc-dispatcher';
import { PROJECT_IPC_KEY } from '../common/ipc/keys';
import * as ipc from '../common/ipc/source-dir-registry';
import { CodeMirrorEditorPageModel } from './components/models';

export class SourceFilePresenter {
  private _pagePresenter: PagePresenter;
  private _ipcDispatcher: RendererIPCDispatcher;
  private _dispatcherNode: IRendererDispatcherNode;
  private _nextPageId = 1;

  constructor({ pagePresenter, ipcDispatcher }: SourceFilePresenter.IConstructorParams) {
    this._pagePresenter = pagePresenter;

    this._dispatcherNode = ipcDispatcher.createNode();
    this._dispatcherNode.onRequest(PROJECT_IPC_KEY, ipc.IPC_OPEN_SRC_FILE, this._onOpenSrcFile);
  }

  dispose(): void {
    if (this._dispatcherNode) {
      this._dispatcherNode.dispose();
      this._dispatcherNode = null;
    }
  }

  private _onOpenSrcFile = (request: ipc.IOpenSourceFileRequest): Promise<void> => {
    return this._pagePresenter.openPage(`test-page-${this._nextPageId++}`,
      async () => {
        // TODO: The presenter should retrieve the file contents from the file service instead of
        //       hitting the disk directly, that way file contents can be cached and the same file
        //       could be opened on multiple pages without each page loading its own copy, and the
        //       file could watch for external changes to the file etc.
        const source = await fs.readFile(request.file, 'utf8');
        const page = new CodeMirrorEditorPageModel({ id: 'SourceFile1' });
        page.title = path.basename(request.file);
        page.editorConfig = {
          value: source,
          mode: 'text/x-c++src'
        };
        return page;
      }
    );
  }
}

export namespace SourceFilePresenter {
  export interface IConstructorParams {
    pagePresenter: PagePresenter;
    ipcDispatcher: RendererIPCDispatcher;
  }
}
