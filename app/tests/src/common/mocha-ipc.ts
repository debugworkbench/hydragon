// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

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

export interface ISuite {
  title: string;
}

export interface ITest {
  title: string;
}

/** Details of an error thrown during a test run in the main process. */
export interface IError {
  name?: string;
  message?: string;
  stack?: string;
}

/** Payload sent by the main process to the renderer process via [[IPC_RENDERER_MOCHA_RUN]]. */
export interface ITestRunOptions {
  file?: string;
  dir?: string;
  /** If set then only tests whose titles match the provided regular expression will be run. */
  grep?: string;
  /** RegExp flags to apply to `grep`. */
  grepFlags?: string;
}
