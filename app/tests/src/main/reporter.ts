// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain } from 'electron';
import { channels, ISuite, ITest } from '../common/mocha-ipc';

class RemoteReporter {
  constructor(page: GitHubElectron.WebContents, runner: any) {
    runner.on('start', () => page.send(channels.MOCHA_START));
    runner.on('end', () => page.send(channels.MOCHA_END));

    runner.on('suite', (suite: Mocha.ISuite) => {
      // skip the root suite
      if (suite.parent) {
        const s: ISuite = {
          title: suite.title,
        };
        page.send(channels.MOCHA_SUITE_START, s);
      }
    });

    runner.on('suite end', (suite: Mocha.ISuite) => {
      if (suite.parent) {
        page.send(channels.MOCHA_SUITE_END);
      }
    });

    runner.on('test', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      page.send(channels.MOCHA_TEST_START, t);
    });

    runner.on('test end', (test: Mocha.ITest) => page.send(channels.MOCHA_TEST_END));

    runner.on('pass', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      page.send(channels.MOCHA_PASS, t);
    });

    runner.on('fail', (test: Mocha.ITest, err: Error) => {
      const t: ITest = {
        title: test.title
      };
      page.send(channels.MOCHA_FAIL, t, { name: err.name, message: err.message, stack: err.stack });
    });

    runner.on('pending', (test: Mocha.ITest) => {
      const t: ITest = {
        title: test.title
      };
      page.send(channels.MOCHA_PENDING, t);
    });
  }
}

export function getReporterConstructor(page: GitHubElectron.WebContents): (runner: any) => void {
  return reporterConsructor.bind(null, page);
}

function reporterConsructor(page: GitHubElectron.WebContents, runner: any): void {
  this._remoteReporter = new RemoteReporter(page, runner);
}
