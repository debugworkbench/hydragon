// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as child_process from 'child_process';
import * as yargs from 'yargs';

const argv: yargs.Argv & ITaskOptions = yargs
  .usage('Usage: $0 <path/to/entry-point.js> [options]')
  .demand(1)
  .option('electron-path', {
    default: getElectronPath,
    describe: `The path to the Electron executable to run, defaults to whatever was last installed
               by the electron-prebuilt package.`,
    type: 'string'
  })
  .options('cwd', {
    describe: 'Working directory for the Electron app.',
    type: 'string'
  })
  .options('debug', {
    describe: 'Enable debugging of the main Electron process.',
    type: 'boolean'
  })
  .options('stop-at-entry', {
    describe: 'Insert a breakpoint on the first line of the Electron app.',
    type: 'boolean'
  })
  .implies('stop-at-entry', 'debug')
  .options('debug-port', {
    describe: 'Port number the debugger can connect to in order to debug the main Electron process.',
    type: 'number'
  })
  .implies('debug-port', 'debug')
  .argv;

interface ITaskOptions {
  electronPath?: string;
  cwd?: string;
  debug?: boolean;
  stopAtEntry?: boolean;
  debugPort?: number;
}

function runElectron(): void {
  const scriptPath = argv._[0];
  const { electronPath, cwd, debug, stopAtEntry, debugPort } = argv;

  const args: string[] = [scriptPath];
  if (debug) {
    let debugArg = stopAtEntry ? '--debug-brk' : '--debug';
    args.push((debugPort >= 0) ? `${debugArg}=${debugPort}` : debugArg);
  }
  const app = child_process.spawnSync(electronPath, args, { cwd });
}

function getElectronPath(): string {
  // try to grab the path from the electron-prebuilt package if it's installed
  // electron-prebuilt exports the path to the electron executable
  return require('electron-prebuilt');
}

runElectron();
