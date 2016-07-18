// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as ipc from '../common/mocha-ipc';

const symbols = {
  OK: '✓',
  ERR: '✖'
};

const styles = {
  bold: 'font-weight:bold;',
  normal: 'font-weight:normal;',
  success: 'color:green;',
  pending: 'color:blue;',
  fail: 'color:red;'
};

// augment the Console type definition that is shipped with TypeScript
declare global {
  interface Console {
    group(groupTitle?: string, ...optionalParams: any[]): void;
    groupCollapsed(groupTitle?: string, ...optionalParams: any[]): void;
  }
}

/**
 * Outputs the results of a Mocha test run to the DevTools console.
 */
export class ReportGenerator {
  private _passCount = 0;
  private _pendingCount = 0;
  private _failures: Array<{ title: string; err: ipc.IError }> = [];

  printHeader(): void {
    console.time('Tests Duration');
  }

  printFooter(): void {
    console.timeEnd('Tests Duration');
    console.log(`%c${this._passCount} passed`, styles.success);
    if (this._failures.length > 0) {
      console.log(`%c${this._failures.length} failed`, styles.fail);
    }
    if (this._pendingCount > 0) {
      console.log(`%c${this._pendingCount} pending`, styles.pending);
    }
    for (let i = 0; i < this._failures.length; ++i) {
      printErrorInfo(i + 1, this._failures[i].title, this._failures[i].err);
    }
  }

  printSuiteHeader(source: string, title: string): void {
    console.group(`[${source}] %c${getDisplayTitle(title)}`, styles.bold);
  }

  printSuiteFooter(): void {
    console.groupEnd();
  }

  printTestPass(source: string, title: string): void {
    const displayTitle = getDisplayTitle(title);
    console.log(`[${source}] %c${symbols.OK} ${displayTitle}`, styles.success);
    this._passCount++;
  }

  printFailedTest(source: string, title: string, err: ipc.IError): void {
    this._failures.push({ title, err });
    const displayTitle = getDisplayTitle(title);
    console.log(
      `[${source}] %c${this._failures.length}) ${symbols.ERR} ${displayTitle}`, styles.fail
    );
  }

  printPendingTest(source: string, title: string): void {
    const displayTitle = getDisplayTitle(title);
    console.log(`[${source}] %c- ${displayTitle}`, styles.pending);
    this._pendingCount++;
  }
}

/** Strip out any tags from the title. */
function getDisplayTitle(title: string): string {
  return title.replace(/@\w+/, '');
}

function printErrorInfo(id: number, testTitle: string, err: ipc.IError): void {
  const message = err.message || '';
  const displayTitle = getDisplayTitle(testTitle);
  if (err.stack) {
    console.groupCollapsed(`%c${id}) ${displayTitle}`, styles.fail);
    console.log('%c' + err.stack, styles.fail);
    console.groupEnd();
  } else {
    console.error(`%c${id}) ${displayTitle}\n%c${message}`, styles.fail, styles.bold);
  }
}
