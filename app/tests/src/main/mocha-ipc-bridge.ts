// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import { channels, ITest, ISuite, IError } from '../common/mocha-ipc';

/**
 * Forwards Mocha test run progress from a renderer process to the reporter page.
 */
export class MochaIPCBridge {
  constructor(reporterPage: GitHubElectron.WebContents) {
    [
      channels.MOCHA_START,
      channels.MOCHA_END,
      channels.MOCHA_SUITE_START,
      channels.MOCHA_SUITE_END,
      channels.MOCHA_TEST_START,
      channels.MOCHA_TEST_END,
      channels.MOCHA_PASS,
      channels.MOCHA_FAIL,
      channels.MOCHA_PENDING
    ].forEach(channel =>
      ipcMain.on(channel, (event, ...args) => reporterPage.send(channel, ...args))
    );
  }
}
