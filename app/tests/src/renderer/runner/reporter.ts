// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as Mocha from 'mocha';
import { channels, ISuite, ITest } from '../../common/mocha-ipc';

/**
 * Mocha reporter that forwards test run progress to the main process.
 */
export class RemoteReporter {
  constructor(runner: any) {
    runner.on('start', () => ipcRenderer.send(channels.MOCHA_START));
    runner.on('end', () => ipcRenderer.send(channels.MOCHA_END));

    runner.on('suite', (suite: Mocha.ISuite) => {
      // skip the root suite
      if (suite.parent) {
        const s: ISuite = {
          title: suite.title,
        };
        ipcRenderer.send(channels.MOCHA_SUITE_START, s);
      }
    });
    runner.on('suite end', (suite: Mocha.ISuite) => {
      if (suite.parent) {
        ipcRenderer.send(channels.MOCHA_SUITE_END);
      }
    });

    runner.on('test', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      ipcRenderer.send(channels.MOCHA_TEST_START, t);
    });

    runner.on('test end', (test: Mocha.ITest) => ipcRenderer.send(channels.MOCHA_TEST_END));

    runner.on('pass', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      ipcRenderer.send(channels.MOCHA_PASS, t);
    });

    runner.on('fail', (test: Mocha.ITest, err: Error) => {
      const t: ITest = {
        title: test.title
      };
      ipcRenderer.send(channels.MOCHA_FAIL, t, { name: err.name, message: err.message, stack: err.stack });
    });

    runner.on('pending', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      ipcRenderer.send(channels.MOCHA_PENDING, t);
    });
  }
}
