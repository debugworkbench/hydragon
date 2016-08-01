// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as ipc from '../../common/mocha-ipc';
import { ReportModel, TestRun, Suite, Test } from './report-model';

/**
 * Consolidates Mocha test run data from multiple processes into a single observable model.
 */
export class ReportGenerator {
  report: ReportModel = new ReportModel();

  constructor() {
    ipcRenderer.on(ipc.channels.MOCHA_START, this._onTestRunStart.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_END, this._onTestRunEnd.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_SUITE_START, this._onSuiteStart.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_SUITE_END, this._onSuiteEnd.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_TEST_START, this._onTestStart.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_TEST_END, this._onTestEnd.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_PASS, this._onTestPass.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_FAIL, this._onTestFail.bind(this));
    ipcRenderer.on(ipc.channels.MOCHA_PENDING, this._onTestPending.bind(this));
  }

  private _onTestRunStart(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestRunStartEventArgs
  ): void {
    // a test run in the main process can launch multiple test runs in renderer processes,
    // in that case the test run in the main process is considered to be the parent of the test runs
    // in the renderer processes
    const parent = this.report.activeTestRun;
    const testRun = new TestRun(args.testRunId, args.testRunTitle, args.totalTestCount, parent);
    testRun.isActive = true;
    if (parent) {
      parent.testRuns.push(testRun);
    } else {
      this.report.testRuns.push(testRun);
    }
  }

  private _onTestRunEnd(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestRunEndEventArgs
  ): void {
    const testRun = this.report.getTestRunById(args.testRunId);
    testRun.isActive = false;
  }

  private _onSuiteStart(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ISuiteStartEventArgs
  ): void {
    const testRun = this.report.getTestRunById(args.suiteId.testRun);
    const parent = args.suiteParentId ? testRun.getSuiteById(args.suiteParentId) : null;
    const suite = new Suite(
      args.suiteId.suite, getDisplayTitle(args.suiteTitle), args.totalTestCount, parent
    );
    suite.isActive = true;
    if (parent) {
      parent.suites.push(suite);
    } else {
      testRun.suites.push(suite);
    }
  }

  private _onSuiteEnd(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ISuiteEndEventArgs
  ): void {
    const suite = this.report.getSuiteById(args.suiteId);
    suite.isActive = false;
  }

  private _onTestStart(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestStartEventArgs
  ): void {
    const suite = this.report.getSuiteById(args.testId);
    const test = new Test(args.testId.test, getDisplayTitle(args.testTitle), suite);
    test.isActive = true;
    suite.tests.push(test);
    const outerTest = args.outerTestId ? this.report.getTestById(args.outerTestId) : null;
    if (outerTest) {
      outerTest.tests.push(test);
    }
  }

  private _onTestEnd(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestEndEventArgs
  ): void {
    const test = this.report.getTestById(args.testId);
    test.isActive = false;
  }

  private _onTestPass(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestStatusEventArgs
  ): void {
    const test = this.report.getTestById(args.testId);
    test.status = 'passed';
  }

  private _onTestFail(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestFailedEventArgs
  ): void {
    const test = this.report.getTestById(args.testId);
    test.status = 'failed';
    test.error = args.error;
  }

  private _onTestPending(
    event: GitHubElectron.IRendererIPCEvent, args: ipc.ITestStatusEventArgs
  ): void {
    const test = this.report.getTestById(args.testId);
    test.status = 'pending';
  }
}

/** Strip out any tags from the title. */
function getDisplayTitle(title: string): string {
  return title.replace(/@\w+/, '');
}
