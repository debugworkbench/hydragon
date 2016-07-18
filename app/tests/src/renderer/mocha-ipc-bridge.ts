// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import { ReportGenerator } from './report-generator';
import { channels, ITest, ISuite, IError } from '../common/mocha-ipc';

/**
 * Displays the progress of Mocha tests that are running in the main and renderer processes in the
 * DevTools console.
 */
export class MochaIPCBridge {
  constructor(reportGenerator: ReportGenerator) {
    const SOURCE = 'M';

    ipcRenderer.on(channels.MOCHA_START, () => reportGenerator.printHeader());
    ipcRenderer.on(channels.MOCHA_END, () => reportGenerator.printFooter());

    ipcRenderer.on(channels.MOCHA_SUITE_START,
      (event: GitHubElectron.IRendererIPCEvent, suite: ISuite) => {
        reportGenerator.printSuiteHeader(SOURCE, suite.title);
      }
    );

    ipcRenderer.on(channels.MOCHA_SUITE_END, (event, suite) => reportGenerator.printSuiteFooter());

    ipcRenderer.on(channels.MOCHA_TEST_START,
      (event: GitHubElectron.IRendererIPCEvent, test: ITest) => {
        reportGenerator.printSuiteHeader(SOURCE, test.title);
      }
    );

    ipcRenderer.on(channels.MOCHA_TEST_END, () => reportGenerator.printSuiteFooter());

    ipcRenderer.on(channels.MOCHA_PASS,
      (event: GitHubElectron.IRendererIPCEvent, test: ITest) => {
        reportGenerator.printTestPass(SOURCE, test.title);
      }
    );

    ipcRenderer.on(channels.MOCHA_FAIL,
      (event: GitHubElectron.IRendererIPCEvent, test: ITest, err: IError) => {
        reportGenerator.printFailedTest(SOURCE, test.title, err);
      }
    );

    ipcRenderer.on(channels.MOCHA_PENDING,
      (event: GitHubElectron.IRendererIPCEvent, test: ITest) => {
        reportGenerator.printPendingTest(SOURCE, test.title);
      }
    );
  }
}
