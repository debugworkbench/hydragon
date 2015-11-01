// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as app from 'app';
import * as BrowserWindow from 'browser-window';
import * as path from 'path';
import Application, { IApplicationArgs } from './application';

//require('crash-reporter').start();

let mainWindow: GitHubElectron.BrowserWindow = null;

interface CommandLineArgs {
  /** Allows to override the PATH environment variable for the process. */
  'env-path'?: string;
}

function main(): void {
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar  to stay active until the user quits
    // explicitly with Cmd + Q.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // TODO: actually parse the command line
  const args: CommandLineArgs = {};

  if (args['env-path'] !== undefined) {
    process.env.PATH = args['env-path'];
  }

  app.on('ready', () => {
    const rootPath = path.resolve(__dirname, '..', '..');
    console.log(`rootPath: ${rootPath}`);
    const application = new Application();
    application.run({ rootPath });
  });
}

main();
