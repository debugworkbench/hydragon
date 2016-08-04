// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as uuid from 'uuid';

export const channels = {
  MOCHA_START: 'mocha:start',
  MOCHA_END: 'mocha:end',
  MOCHA_SUITE_START: 'mocha:suite',
  MOCHA_SUITE_END: 'mocha:suite-end',
  MOCHA_TEST_START: 'mocha:test',
  MOCHA_TEST_END: 'mocha:test-end',
  MOCHA_PASS: 'mocha:pass',
  MOCHA_FAIL: 'mocha:fail',
  MOCHA_PENDING: 'mocha:pending',
  /** Used by the main process to tell a renderer process to start a Mocha test run. */
  RENDERER_MOCHA_RUN: 'mocha:run',
  /** Used by a renderer process to signal to the main process that a Mocha run has ended. */
  RENDERER_MOCHA_RUN_END: 'mocha:run-end',
};

export interface ICompositeSuiteId {
  testRun: string;
  suite: number;
}

export interface ICompositeTestId extends ICompositeSuiteId {
  test: number;
}

export interface ITestRunStartEventArgs {
  /** Test run UUID. */
  testRunId: string;
  /** Test run title. */
  testRunTitle?: string;
  /**
   * Total number of tests in the test run, if the grep option was specified this number will only
   * include tests that matched the regexp.
   */
  totalTestCount: number;
}

export interface ITestRunEndEventArgs {
  /** Test run UUID. */
  testRunId: string;
}

export interface ISuiteStartEventArgs {
  suiteId: ICompositeSuiteId;
  suiteTitle: string;
  /**
   * Total number of tests in the suite, this number includes tests that will not actually run
   * because they didn't match the grep regexp (if one was provided for the test run).
   */
  totalTestCount: number;
  suiteParentId?: number;
}

export interface ISuiteEndEventArgs {
  suiteId: ICompositeSuiteId;
}

export interface ITestStartEventArgs {
  testId: ICompositeTestId;
  testTitle: string;
  outerTestId?: ICompositeTestId;
}

export interface ITestEndEventArgs {
  testId: ICompositeTestId;
}

export interface ITestStatusEventArgs {
  testId: ICompositeTestId;
}

export interface ITestFailedEventArgs extends ITestStatusEventArgs {
  error: IError;
}

/** Details of an error thrown during a test run. */
export interface IError {
  name?: string;
  message?: string;
  stack?: string;
}

/** Payload sent by the main process to the renderer process via [[IPC_RENDERER_MOCHA_RUN]]. */
export interface ITestRunOptions {
  title?: string;
  file?: string;
  dir?: string;
  /** If set then only tests whose titles match the provided regular expression will be run. */
  grep?: string;
  /** RegExp flags to apply to `grep`. */
  grepFlags?: string;
}

// FIXME: This needs to be integrated into the Mocha typings in DefinitelyTyped
declare global {
  namespace Mocha {
    interface ISuite {
      /** @return The total number of tests in this suite. */
      total(): number;
    }
  }
}

/**
 * Forwards Mocha test runner events to a user defined function.
 */
export class TestRunnerIPC {
  private _testRunId: string;
  private _nextSuiteId = 1;
  private _nextTestId = 1;
  private _suiteToIdMap = new Map<Mocha.ISuite, number>();
  private _testToIdMap = new Map<Mocha.ITest, number>();

  /**
   * @param runner Mocha test runner from which events should be forwarded.
   * @param send Function to invoke for each event.
   */
  constructor(runner: any, send: (channel: string, args: any) => void) {
    runner.on('start', () => {
      this._testRunId = uuid.v4();
      this._nextSuiteId = 1;
      this._nextTestId = 1;
      this._suiteToIdMap.clear();
      this._testToIdMap.clear();

      const args: ITestRunStartEventArgs = {
        testRunId: this._testRunId,
        totalTestCount: runner.total
      };
      send(channels.MOCHA_START, args);
    });

    runner.on('end', () => {
      const args: ITestRunEndEventArgs = {
        testRunId: this._testRunId
      };
      send(channels.MOCHA_END, args);
    });

    runner.on('suite', (suite: Mocha.ISuite) => {
      // skip the root suite
      if (suite.parent) {
        const id = this._nextSuiteId++;
        this._suiteToIdMap.set(suite, id);
        const args: ISuiteStartEventArgs = {
          suiteId: {
            testRun: this._testRunId,
            suite: id
          },
          suiteTitle: suite.title,
          totalTestCount: suite.total(),
          suiteParentId: this._suiteToIdMap.get(suite.parent)
        };
        send(channels.MOCHA_SUITE_START, args);
      }
    });

    runner.on('suite end', (suite: Mocha.ISuite) => {
      // skip the root suite
      if (suite.parent) {
        const args: ISuiteEndEventArgs = {
          suiteId: {
            testRun: this._testRunId,
            suite: this._suiteToIdMap.get(suite)
          }
        };
        send(channels.MOCHA_SUITE_END, args);
      }
    });

    runner.on('test', (test: Mocha.ITest) => {
      const id = this._nextTestId++;
      this._testToIdMap.set(test, id);
      const args: ITestStartEventArgs = {
        testId: {
          testRun: this._testRunId,
          suite: this._suiteToIdMap.get(test.parent),
          test: id
        },
        testTitle: test.title
      };
      send(channels.MOCHA_TEST_START, args);
    });

    runner.on('test end', (test: Mocha.ITest) => {
      const args: ITestEndEventArgs = {
        testId: this._getCompositeTestId(test)
      };
      send(channels.MOCHA_TEST_END, args);
    });

    runner.on('pass', (test: Mocha.ITest) => {
      const args: ITestStatusEventArgs = {
        testId: this._getCompositeTestId(test)
      };
      send(channels.MOCHA_PASS, args);
    });

    runner.on('fail', (test: Mocha.ITest, err: Error) => {
      const args: ITestFailedEventArgs = {
        testId: this._getCompositeTestId(test),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        }
      };
      send(channels.MOCHA_FAIL, args);
    });

    runner.on('pending', (test: Mocha.ITest) => {
      const args: ITestStatusEventArgs = {
        testId: this._getCompositeTestId(test)
      };
      send(channels.MOCHA_PENDING, args);
    });
  }

  private _getCompositeTestId(test: Mocha.ITest): ICompositeTestId {
    return {
	    testRun: this._testRunId,
      suite: this._suiteToIdMap.get(test.parent),
      test: this._testToIdMap.get(test)
    };
  }
}
