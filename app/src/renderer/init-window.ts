// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as electron from 'electron';
import * as url from 'url';
import { RendererContext } from './renderer-context';
import * as AppWindowConfig from '../common/app-window-config';

window.onload = (e: Event) => {
  const config = AppWindowConfig.decodeFromUriComponent(window.location.hash.substr(1));
  RendererContext.create(config)
  .then(rendererContext => {
    window.onunload = () => rendererContext.dispose();
    rendererContext.showWindow();
  })
  .catch((error) => {
    showError(error);
  });
};

function showError(error: any): void {
  const currentWindow = electron.remote.getCurrentWindow();
  currentWindow.setSize(800, 600);
  currentWindow.center();
  currentWindow.show();
  currentWindow.webContents.openDevTools();
  console.error(error.stack || error);
}
