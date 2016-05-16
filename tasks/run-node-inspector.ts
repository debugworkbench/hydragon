// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as yargs from 'yargs';

const argv: yargs.Argv & ITaskOptions = yargs
  .usage('Usage: $0 <path/to/node-inspector.js> [options]')
  .demand(1)
  .option('electron-path', {
    default: getElectronPath,
    describe: `The path to the Electron executable to debug, defaults to whatever was last
               installed by the electron-prebuilt package.`,
    type: 'string'
  })
  .options('cwd', {
    describe: 'Working directory for the node-inspector app.',
    type: 'string'
  })
  .argv;

interface ITaskOptions {
  electronPath?: string;
  cwd?: string;
}

function runInspector(): void {
  const scriptPath = argv._[0];
  const { electronPath, cwd } = argv;
  const args: string[] = ['--no-preload'];
  const inspector = child_process.fork(
    scriptPath, args, { cwd, execPath: electronPath, silent: true }
  );

  inspector.on('error', (error: Error) => console.error(error));

  inspector.on('message', (msg: any) => {
    if (msg.event === 'SERVER.LISTENING') {
      console.info(`Visit ${msg.address.url} to start debugging.`);
    } else if (msg.event === 'SERVER.ERROR') {
      console.error(`Cannot start the server: ${msg.error.code}.`);
    }
  });

  inspector.on('close', (exitCode: number, signal: string) => {
    if (exitCode === 0) {
      console.info('node-inspector finished running');
    } else if (signal) {
      console.error(`node-inspector signaled with ${signal}`);
    } else {
      console.info('node-inspector terminated');
    }
  });
}

function getElectronPath(): string {
  // try to grab the path from the electron-prebuilt package if it's installed
  // electron-prebuilt exports the path to the electron executable
  return require('electron-prebuilt');
}

runInspector();
