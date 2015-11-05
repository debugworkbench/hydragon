// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

'use strict';

import * as path from 'path';

interface ITaskOptions {
  electronPath?: string;
  scriptPath: string;
  cwd?: string;
  debug?: boolean;
  stopAtEntry?: boolean;
  debugPort?: number;
}

function activatePlugin(grunt: IGrunt) {
  grunt.registerMultiTask('run-electron', 'Run Electron', function () {
    const task: grunt.task.ITask = this;
    const options = task.options<ITaskOptions>(<any> {});
    const { scriptPath, cwd, debug, stopAtEntry, debugPort } = options;
    const electronPath = options.electronPath || getElectronPath();

    if (!scriptPath) {
      grunt.fatal('scriptPath must be specified!');
    }

    const done = task.async();

    const args: string[] = [scriptPath];
    if (debug) {
      let debugArg = stopAtEntry ? '--debug-brk' : '--debug';
      args.push((debugPort >= 0) ? `${debugArg}=${debugPort}` : debugArg);
    }
    const spawnOptions: grunt.util.ISpawnOptions = {
      cmd: electronPath,
      args
    };
    const electron = grunt.util.spawn(spawnOptions, (error, result, code) => {
      error ? done(error) : done();
    });
  });

  function getElectronPath(): string {
    // try to grab the path from the electron-prebuilt package if it's installed
    try {
      // electron-prebuilt exports the path to the electron executable
      return require('electron-prebuilt');
    } catch (error) {
      grunt.fatal('electron-prebuilt not found, please specify electronPath!');
    }
  }
}

export = activatePlugin;
