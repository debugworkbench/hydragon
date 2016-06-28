// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as Mocha from 'mocha';
import { ReportGenerator } from './report-generator';

/**
 * Mocha reporter that outputs the results of a test run to the DevTools console.
 */
export class MochaReporter {
  constructor(runner: any, { reporterOptions }: { reporterOptions: MochaReporter.IOptions }) {
    const { reportGenerator } = reporterOptions;
    const SOURCE = 'R';
    runner.on('suite', (suite: Mocha.ISuite) => {
      // skip the root suite
      if (suite.parent) {
        reportGenerator.printSuiteHeader(SOURCE, suite.title);
      }
    });
    runner.on('suite end', (suite: Mocha.ISuite) => {
      if (suite.parent) {
        reportGenerator.printSuiteFooter();
      }
    });
    runner.on('pass', (test: Mocha.ITest) => reportGenerator.printTestPass(SOURCE, test.title));
    runner.on('fail', (test: Mocha.ITest, err: Error) => {
      reportGenerator.printFailedTest(SOURCE, test.title, err);
    });
    runner.on('pending', (test: Mocha.ITest) => reportGenerator.printPendingTest(SOURCE, test.title));
  }
}

export namespace MochaReporter {
  export interface IOptions {
    reportGenerator: ReportGenerator;
  }
}
