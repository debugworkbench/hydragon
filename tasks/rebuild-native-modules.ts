// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as path from 'path';
import * as fs from 'fs';
import { installNodeHeaders, rebuildNativeModules } from 'electron-rebuild';
import * as yargs from 'yargs';
import { preGypFixRun } from 'electron-rebuild/lib/node-pre-gyp-fix';

const argv: yargs.Argv & ITaskOptions = yargs
  // `node_modules` directory containing the native NodeJS modules that need to be rebuilt
  .usage('Usage: $0 <path/to/node_modules> [options]')
  .demand(1)
  .option('p', {
    alias: 'path',
    default: getElectronPath,
    describe: `The path to the Electron executable for which native modules need to be rebuilt,
               defaults to whatever was last installed by the electron-prebuilt package.`,
    type: 'string'
  })
  .options('v', {
    alias: 'version',
    default: getElectronVersion,
    describe: `The Electron version for which native modules need to be rebuilt,
               defaults to whichever version was last installed by the electron-prebuilt package.`,
    type: 'string'
  })
  .options('a', {
    alias: 'arch',
    describe: 'Target architecture, either `x64` or `ia32`',
    type: 'string'
  })
  .argv;

interface ITaskOptions {
  /**
   * The path to the Electron executable for which native modules need to be rebuilt,
   * defaults to whatever was last installed by the `electron-prebuilt` package.
   */
  p?: string;
  /**
   * The Electron version for which native modules need to be rebuilt,
   * defaults to whichever version was last installed by the `electron-prebuilt` package.
   */
  v?: string;
  /** `x64` or `ia32` */
  a?: string;
}

/**
 * Rebuild any native NodeJS modules in the given `node_modules` directory to work with the
 * specified Electron runtime. If the Electron path and version are not specified they'll be
 * obtained from the `electron-prebuilt` package.
 */
async function executeRebuild(): Promise<void> {
    const nodeModulesDir = argv._[0];
    const { p: electronPath, v: electronVersion, a: arch } = argv;

    console.log(`Rebuilding native modules in ${nodeModulesDir} for Electron ${electronVersion}...`);
    await installNodeHeaders(electronVersion, null, null, arch);
    await rebuildNativeModules(electronVersion, nodeModulesDir, null, null, arch);
    await preGypFixRun(nodeModulesDir, true, electronPath);
    console.log(`Rebuild finished`);
}

function getElectronPath(): string {
  // try to grab the path from the electron-prebuilt package if it's installed
  // electron-prebuilt exports the path to the electron executable
  return require('electron-prebuilt');
}

function getElectronVersion(): string {
  // try to grab the version from the electron-prebuilt package if it's installed
  const packageText = fs.readFileSync(require.resolve('electron-prebuilt/package.json'), 'utf8');
  const packageJson = JSON.parse(packageText);
  return packageJson.version;
}

executeRebuild().catch(error => console.log(error));
