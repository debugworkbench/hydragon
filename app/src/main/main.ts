// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { app, protocol } from 'electron';
import * as path from 'path';
import { Application } from './application';
import { AppProtocolHandler } from './protocol-handlers';

//require('crash-reporter').start();

let application: Application;

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

  // protocol.registerStandardSchemes() must be called before the `ready` event is emitted
  protocol.registerStandardSchemes([AppProtocolHandler.scheme]);

  app.on('ready', () => {
    const rootPath = path.resolve(__dirname, '..', '..');
    console.log(`rootPath: ${rootPath}`);
    application = new Application();
    application.run({ rootPath });
  });
}

main();
