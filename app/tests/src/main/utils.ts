// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow } from 'electron';
import { channels as mochaChannels, ITestRunOptions } from '../common/mocha-ipc';

/**
 * Run some Mocha tests in the renderer process.
 *
 * @param options
 * @param options.file Path to JavaScript file that contains the tests to be run.
 * @parma options.grep Optional regular expression to forward to Mocha so that it runs only the
 *                     tests whose titles match the expression.
 * @return A promise that will be resolved when the test run ends.
 */
export function runRendererTests(options: { file: string; grep?: RegExp }): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    ipcMain.once(mochaChannels.RENDERER_MOCHA_RUN_END,
      (event: GitHubElectron.IMainIPCEvent, failureCount: number) => {
        (failureCount > 0)
          ? reject(new Error(`${failureCount} tests failed in the renderer process.`))
          : resolve();
      }
    );
    const runOptions: ITestRunOptions = {
      file: options.file,
      grep: options.grep ? options.grep.source : undefined,
      grepFlags: options.grep ? options.grep.flags : undefined
    };
    mainWindow.webContents.send(mochaChannels.RENDERER_MOCHA_RUN, runOptions);
  });
}
