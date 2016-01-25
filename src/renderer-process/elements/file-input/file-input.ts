// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as pd from 'polymer-ts-decorators';
import * as electron from 'electron';

@pd.is('file-input')
export class FileInputElement extends Polymer.BaseClass() {
  @pd.property({ type: String })
  inputLabel: string;

  @pd.property({ type: String, notify: true })
  filePath: string;

  openBrowseDialog(): void {
    // FIXME: Move this to the main process, all we should be doing here is sending a request to
    //        the main proc and then setting this.filePath if/when the user picks a file.

    // Apparently on OS X the open dialog shouldn't have a parent window
    const parentWindow = (process.platform !== 'darwin') ? electron.remote.getCurrentWindow() : null;
    const dialog = electron.remote.dialog;
    dialog.showOpenDialog(
      parentWindow,
      {
        title: 'Open File',
        properties: ['openFile'],
        defaultPath: this.filePath
      },
      (paths: string[]) => {
        if (paths && (paths.length > 0)) {
          this.filePath = paths[0];
        }
      }
    );
  }
}
