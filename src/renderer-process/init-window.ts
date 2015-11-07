// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import RendererContext from './renderer-context';
import * as remote from 'remote';

window.onload = (e: Event) => {
  RendererContext.create().then(() => {
    RendererContext.get().showWindow();
  })
  .catch((error) => {
    showError(error);
  });
};

function showError(error: any): void {
  const currentWindow = remote.getCurrentWindow();
  currentWindow.setSize(800, 600);
  currentWindow.center();
  currentWindow.show();
  currentWindow.webContents.openDevTools();
  console.error(error.stack || error);
}
