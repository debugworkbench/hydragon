// Copyright (c) 2015-2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

interface ITaskOptions {
  electronPath?: string;
  scriptPath: string;
  cwd?: string;
  stopAtStart?: boolean;
}

function activatePlugin(grunt: IGrunt) {
  grunt.registerMultiTask('run-node-inspector', 'Run node-inspector with Electron', function () {
    const task: grunt.task.ITask = this;

    const options = task.options<ITaskOptions>(<any> {});

    const { scriptPath, cwd, stopAtStart } = options;
    const electronPath = options.electronPath || getElectronPath();

    if (!scriptPath) {
      grunt.fatal('scriptPath must be specified!');
    }

    const done = task.async();

    const args: string[] = ['--no-preload'];
    const inspector = child_process.fork(scriptPath, args, { cwd, execPath: electronPath, silent: true });

    inspector.on('error', (error: Error) => {
      done(error);
    });

    inspector.on('message', (msg: any) => {
      if (msg.event === 'SERVER.LISTENING') {
        grunt.log.writeln(`Visit ${msg.address.url} to start debugging.`);
      } else if (msg.event === 'SERVER.ERROR') {
        grunt.log.writeln(`Cannot start the server: ${msg.error.code}.`);
      }
    });

    inspector.on('close', (exitCode: number, signal: string) => {
      if (exitCode === 0) {
        done();
      } else if (signal) {
        done(new Error(signal));
      } else {
        done();
      }
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
