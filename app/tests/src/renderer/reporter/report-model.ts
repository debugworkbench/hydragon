// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as mobx from 'mobx';
import { ICompositeSuiteId, ICompositeTestId, IError } from '../../common/mocha-ipc';

export class ReportModel {
  /** Observable list of all top-level test runs. */
  @mobx.observable
  testRuns: TestRun[] = [];

  @mobx.computed
  get activeTestRun(): TestRun | null {
    if (this.testRuns.length > 0) {
      const currentTestRun = this.testRuns[this.testRuns.length - 1];
      if (currentTestRun.isActive) {
        return currentTestRun;
      }
    }
    return null;
  }

  getTestRunById(id: string): TestRun | null {
    for (let testRun of this.testRuns) {
      if (testRun.id === id) {
        return testRun;
      } else {
        const innerTestRun = testRun.getTestRunById(id);
        if (innerTestRun) {
          return innerTestRun;
        }
      }
    }
    return null;
  }

  getSuiteById(suiteId: ICompositeSuiteId): Suite | null {
    const testRun = this.getTestRunById(suiteId.testRun);
    return testRun.getSuiteById(suiteId.suite);
  }

  getTestById(testId: ICompositeTestId): Test | null {
    const suite = this.getSuiteById(testId);
    return suite.getTestById(testId.test);
  }
}

export class TestRun {
  @mobx.observable
  isActive = false;

  /** Observable list of all top level test suites in this test run. */
  @mobx.observable
  suites: Suite[] = [];

  /**
   * Observable list of all top level test runs spawned during this test run.
   * This is filled in when a test in the main process starts a test run in a renderer process.
   */
  @mobx.observable
  testRuns: TestRun[] = [];

  @mobx.computed
  get pendingTestCount(): number {
    return this.getTestCountByStatus('pending');
  }

  @mobx.computed
  get failedTestCount(): number {
    return this.getTestCountByStatus('failed');
  }

  @mobx.computed
  get passedTestCount(): number {
    return this.getTestCountByStatus('passed');
  }

  constructor(
    public id: string,
    public title: string,
    public totalTestCount: number,
    public process: string,
    public parent: TestRun | null
  ) {
  }

  /** Count the number tests in the test run that have the given status. */
  getTestCountByStatus(status: TestStatus): number {
    return this.suites.reduce((count, suite) => count + suite.getTestCountByStatus(status), 0);
  }

  /**
   * Find the nested test run matching the given id.
   *
   * The search is recursive, so if a nested test run contains nested test runs those will be
   * searched too.
   *
   * @return Either the matching test run, or `null` if no match is found.
   */
  getTestRunById(id: string): TestRun | null {
    for (let testRun of this.testRuns) {
      if (testRun.id === id) {
        return testRun;
      } else {
        const innerTestRun = testRun.getTestRunById(id);
        if (innerTestRun) {
          return innerTestRun;
        }
      }
    }
    return null;
  }

  /**
   * Find the suite matching the given id.
   *
   * The search is recursive, so if a suite contains nested suites those will be searched too.
   *
   * @return Either the matching suite, or `null` if no match is found.
   */
  getSuiteById(id: number): Suite | null {
    for (let suite of this.suites) {
      if (suite.id === id) {
        return suite;
      } else {
        const innerSuite = suite.getSuiteById(id);
        if (innerSuite) {
          return innerSuite;
        }
      }
    }
    return null;
  }
}

export class Suite {
  @mobx.observable
  isActive = false;

  /** Observable list of all top level suites in this suite. */
  @mobx.observable
  suites: Suite[] = [];

  /** Observable list of all tests in this suite. */
  @mobx.observable
  tests: Test[] = [];

  @mobx.computed
  get pendingTestCount(): number {
    return this.getTestCountByStatus('pending');
  }

  @mobx.computed
  get failedTestCount(): number {
    return this.getTestCountByStatus('failed');
  }

  @mobx.computed
  get passedTestCount(): number {
    return this.getTestCountByStatus('passed');
  }

  constructor(
    public id: number,
    public title: string,
    public totalTestCount: number,
    public process: string,
    public parent: Suite | null
  ) {
  }

  /** Count the number tests in the suite that have the given status. */
  getTestCountByStatus(status: TestStatus): number {
    return this.suites.reduce((count, suite) => count + suite.getTestCountByStatus(status), 0)
      + this.tests.filter(test => test.status === status).length;
  }

  /**
   * Find the suite matching the given id.
   *
   * The search is recursive, so if a suite contains nested suites those will be searched too.
   *
   * @return Either the matching suite, or `null` if no match is found.
   */
  getSuiteById(id: number): Suite | null {
    for (let suite of this.suites) {
      if (suite.id === id) {
        return suite;
      } else {
        const innerSuite = suite.getSuiteById(id);
        if (innerSuite) {
          return innerSuite;
        }
      }
    }
    return null;
  }

  /**
   * Find the test matching the given id.
   *
   * @return Either the matching test, or `null` if no match is found.
   */
  getTestById(id: number): Test | null {
    for (let test of this.tests) {
      if (test.id === id) {
        return test;
      }
    }
    return null;
  }
}

export type TestStatus = 'passed' | 'failed' | 'pending' | null;

export class Test {
  @mobx.observable
  isActive = false;

  @mobx.observable
  status: TestStatus = null;

  /**
   * Observable list of nested tests.
   * When a test in the main process starts a test run in a renderer process, this list will consist
   * of the tests in that test run.
   */
  @mobx.observable
  tests: Test[] = [];

  error: IError | null = null;

  get process(): string {
    return this.parent.process;
  }

  constructor(public id: number, public title: string, public parent: Suite | null) {
  }
}
