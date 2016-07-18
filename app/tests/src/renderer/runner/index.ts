// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as Mocha from 'mocha';
import * as walkDir from 'walkdir';
import * as path from 'path';
import { RemoteReporter } from './reporter';
import { channels, ITestRunOptions } from '../../common/mocha-ipc';

declare global {
  interface Mocha {
    reporter(reporter: RemoteReporter): Mocha;
  }
}

ipcRenderer.on(channels.RENDERER_MOCHA_RUN,
  (event: GitHubElectron.IRendererIPCEvent, options: ITestRunOptions) => {
    runTests(options)
    .then(failureCount => ipcRenderer.send(channels.RENDERER_MOCHA_RUN_END, failureCount))
    .catch(error => {
      throw error;
    });
  }
);

function addFile(mocha: Mocha, file: string): void {
  // clear out the test file from the require cache to work around a Mocha "feature" where it
  // skips running tests from a file that was previously loaded by any other Mocha instance in
  // this process
  delete require.cache[file];
  mocha.addFile(file);
}

function findFiles(options: ITestRunOptions): Promise<Array<string>> {
  return new Promise<Array<string>>((resolve, reject) => {
    if (options.file) {
      // TODO: check if the file actually exists?
      resolve([options.file]);
    } else if (options.dir) {
      const files: string[] = [];

      const dirWalker = walkDir(options.dir, {
        no_recurse: false,
        max_depth: 2
      });

      dirWalker.on('file', (filePath: string) => {
        if (/\.js$/.test(filePath)) {
          files.push(filePath);
        }
      });

      dirWalker.on('end', () => resolve(files));
    } else {
      reject(new Error("File or directory containing tests wasn't provided."));
    }
  });
}

function runTests(options: ITestRunOptions): Promise<number> {
  return findFiles(options)
  .then(files => new Promise<number>((resolve, reject) => {
    const mocha = new Mocha();
    files.forEach(file => addFile(mocha, file));
    mocha
    .grep(new RegExp(options.grep, options.grepFlags))
    .reporter(RemoteReporter)
    .run(resolve);
  }));
}