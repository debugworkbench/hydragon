// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

'use strict';

import * as path from 'path';
import * as fs from 'fs';
import { installNodeHeaders, rebuildNativeModules } from 'electron-rebuild';

interface ITaskOptions {
  /** The `node_modules` directory containing the native NodeJS modules that need to be rebuilt. */
  nodeModulesDir: string;
  /**
   * The path to the Electron executable for which native modules need to be rebuilt,
   * defaults to whatever was last installed by the `electron-prebuilt` package.
   */
  electronPath?: string;
  /**
   * The Electron version for which native modules need to be rebuilt,
   * defaults to whichever version was last installed by the `electron-prebuilt` package.
   */
  electronVersion?: string;
  /** `x64` or `ia32` */
  arch?: string;
}

function activatePlugin(grunt: IGrunt) {
  /**
   * Rebuild any native NodeJS modules in the given `node_modules` directory to work with the
   * specified Electron runtime. If the Electron path and version are not specified this task
   * will attempt to determine the correct path and version from the `electron-prebuilt` package.
   */
  grunt.registerMultiTask('rebuild-native-modules', 'Rebuild Native NodeJS Modules', function () {
    const task: grunt.task.ITask = this;

    const options = task.options<ITaskOptions>(<any> {});

    const { nodeModulesDir, arch } = options;

    if (!nodeModulesDir) {
      grunt.fatal('nodeModulesDir must be specified!');
    }

    const electronPath = options.electronPath || getElectronPath();
    const electronVersion = options.electronVersion || getElectronVersion();

    const done = task.async();

    Promise.resolve()
    .then(() => installNodeHeaders(electronVersion, null, null, arch))
    .then(() => {
      grunt.log.writeln(`Rebuilding native modules in ${nodeModulesDir} for Electron ${electronVersion}...`);
      return rebuildNativeModules(electronVersion, nodeModulesDir, null, null, arch);
    })
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
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

  function getElectronVersion(): string {
    // try to grab the version from the electron-prebuilt package if it's installed
    try {
      const packageJson = grunt.file.readJSON(require.resolve('electron-prebuilt/package.json'));
      if (packageJson.version) {
        return packageJson.version;
      }
    } catch (error) {
      grunt.fatal('electron-prebuilt not found, please specify electronVersion!');
    }
  }
}

export = activatePlugin;
