// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import { channels, ITestStartEventArgs, ICompositeTestId } from '../common/mocha-ipc';

/**
 * Forwards Mocha runner events from all renderer processes to the reporter page.
 */
export class RendererRunnerIPC {
  /** Identifier of the test currently running in the main process. */
  currentBrowserTestId: ICompositeTestId | null = null;

  constructor(reporterPage: GitHubElectron.WebContents) {
    [
      channels.MOCHA_START,
      channels.MOCHA_END,
      channels.MOCHA_SUITE_START,
      channels.MOCHA_SUITE_END,
      channels.MOCHA_TEST_END,
      channels.MOCHA_PASS,
      channels.MOCHA_FAIL,
      channels.MOCHA_PENDING
    ].forEach(channel =>
      ipcMain.on(channel, (event, ...args) => reporterPage.send(channel, ...args))
    );

    ipcMain.on(channels.MOCHA_TEST_START,
      (event: GitHubElectron.IMainIPCEvent, args: ITestStartEventArgs) => {
        args.outerTestId = this.currentBrowserTestId;
        reporterPage.send(channels.MOCHA_TEST_START, args);
      }
    );
  }
}
