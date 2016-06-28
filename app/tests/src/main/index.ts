// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { app, BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as Mocha from 'mocha';
import * as walkDir from 'walkdir';
import { getReporterConstructor } from './reporter';

let mainWindow: GitHubElectron.BrowserWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      backgroundThrottling: false
    }
  });
  mainWindow.loadURL(url.format({
    protocol: 'file',
    pathname: path.resolve(__dirname, '..', '..', 'static', 'index.html')
  }));

  mainWindow.webContents.once('devtools-opened', () => runTests(mainWindow.webContents));
  mainWindow.webContents.openDevTools();
});

function runTests(page: GitHubElectron.WebContents): void {
  const reporterConstructor = getReporterConstructor(page);
  const mocha = new Mocha();

  // read in all test files
  const dirWalker = walkDir(path.join(__dirname, 'suites'), {
    no_recurse: false,
    max_depth: 2
  });

  dirWalker.on('file', (filePath: string) => {
    if (/\.js$/.test(filePath)) {
      mocha.addFile(filePath);
    }
  });

  dirWalker.on('end', () => {
    const runner = mocha
      .ui('bdd')
      .reporter(reporterConstructor)
      .run(failureCount => {/*app.exit(failureCount)*/});
  });
}
