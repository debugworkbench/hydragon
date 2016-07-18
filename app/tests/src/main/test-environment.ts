// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcMain, BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as Mocha from 'mocha';
import * as walkDir from 'walkdir';
import { encodeToUriComponent, IWindowConfig } from '../common/window-config';
import { MochaIPCBridge } from './mocha-ipc-bridge';
import { getReporterConstructor } from './reporter';
import { channels as mochaChannels, ITestRunOptions } from '../common/mocha-ipc';

export type PageId = '1st' | '2nd';

/**
 * A singleton that sets up the test environment in the main process.
 *
 * Mocha tests in the main process can use `TestEnvironment.instance` to run one or more tests in
 * renderer processes.
 */
export class TestEnvironment {
  /** Singleton instance. */
  static instance: TestEnvironment;

  /** Window that will be used to display test run progress and results. */
  private _reporterWindow: GitHubElectron.BrowserWindow;
  /** Windows that will be used to run tests in renderer processes. */
  private _testRunnerWindows: GitHubElectron.BrowserWindow[] = [];
  /** Promise that will be resolved when the test environment has been initialized. */
  private _ready: Promise<void>;

  constructor() {
    TestEnvironment.instance = this;
    this._ready = createReporterWindow()
    .then(wnd => this._reporterWindow = wnd);
  }

  /** Add a callback to be invoked when the test environment is ready to run tests. */
  onReady(callback: () => void): void {
    this._ready = this._ready.then(callback);
  }

  /**
   * Get the page matching the given identifier.
   *
   * @return The page matching the given identifier, or `null` if no match was found.
   */
  getPageById(id: PageId): GitHubElectron.WebContents {
    const idx = Number(id[0]) - 1;
    return (idx < this._testRunnerWindows.length) ? this._testRunnerWindows[idx].webContents : null;
  }

  /**
   * Run all the tests.
   */
  async runTests(): Promise<void> {
    // FIXME: run browser unit tests first since they don't require spinning up renderer processes

    // run the renderer unit tests first, since they should be quick and simple
    await this.runRendererTests({
      dir: path.resolve(__dirname, '../renderer/suites'),
      grep: /(\s|^)@unit\b/
    });
    await this.runBrowserTests();
  }

  /**
   * Run some Mocha tests in a renderer process.
   *
   * @param options
   * @param options.page Identifier of the page the tests should be run in.
   * @param options.file Path to JavaScript file that contains the tests to be run.
   * @param options.grep Optional regular expression to forward to Mocha so that it runs only the
   *                     tests whose titles match the expression.
   * @return A promise that will be resolved when the test run ends.
   */
  runRendererTests(
    options: { page?: PageId, file?: string; dir?: string, grep?: RegExp }
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      ipcMain.once(mochaChannels.RENDERER_MOCHA_RUN_END,
        (event: GitHubElectron.IMainIPCEvent, failureCount: number) => {
          (failureCount > 0)
            ? reject(new Error(`${failureCount} tests failed in the renderer process.`))
            : resolve();
        }
      );

      const runOptions: ITestRunOptions = {
        file: options.file,
        dir: options.dir,
        grep: options.grep ? options.grep.source : undefined,
        grepFlags: options.grep ? options.grep.flags : undefined
      };

      this._ensurePageExists(options.page || '1st')
      .then(page => page.send(mochaChannels.RENDERER_MOCHA_RUN, runOptions));
    });
  }

  /**
   * Run Mocha tests in the main/browser process.
   */
  runBrowserTests(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const reporterConstructor = getReporterConstructor(this._reporterWindow.webContents);
      const mocha = new Mocha();

      // read in all test files
      const dirWalker = walkDir(path.join(__dirname, 'suites'), {
        no_recurse: false,
        max_depth: 2
      });

      dirWalker.on('file', (filePath: string) => {
        if (/\.js$/.test(filePath)) {
          mocha.addFile(filePath);
        }
      });

      dirWalker.on('end', () => {
        mocha
        .ui('bdd')
        .reporter(reporterConstructor)
        .run(failureCount => resolve());
      });
    });
  }

  /**
   * Get the page matching the given identifier, if the page doesn't exist it will be created.
   */
  private _ensurePageExists(pageId: PageId): Promise<GitHubElectron.WebContents> {
    return Promise.resolve()
    .then(() => {
      let page = this.getPageById(pageId);
      if (page) {
        return page;
      } else {
        return createTestRunnerWindow()
        .then(wnd => {
          // FIXME: This doesn't work if the 2nd page is created before the 1st since the index
          //        computed by getPageById() won't match the real array index. Should probably
          //        just create all the runner windows before starting the renderer integration
          //        tests so test timing isn't affected.
          this._testRunnerWindows.push(wnd);
          return wnd.webContents;
        });
      }
    });
  }
}

function createWindow(windowConfig: IWindowConfig): GitHubElectron.BrowserWindow {
  const browserWindow = new BrowserWindow({
    title: windowConfig.isReporter ? 'Reporter' : 'Runner',
    webPreferences: {
      backgroundThrottling: false
    }
  });
  browserWindow.loadURL(url.format({
    protocol: 'file',
    pathname: path.resolve(__dirname, '..', '..', 'static', 'index.html')
  }) + '#' + encodeToUriComponent(windowConfig));
  return browserWindow;
}

function createReporterWindow(): Promise<GitHubElectron.BrowserWindow> {
  return new Promise<GitHubElectron.BrowserWindow>((resolve, reject) => {
    const wnd = createWindow({ isReporter: true });
    // pipe test run progress from the test runner windows to the reporter window
    new MochaIPCBridge(wnd.webContents);
    // test run progress and results are displayed in the DevTools console
    wnd.webContents.once('devtools-opened', () => {
      // give the DevTools window a bit of time to get its act together to ensure the debugger
      // doesn't miss any breakpoints
      setTimeout(() => resolve(wnd), 1000);
    });
    wnd.webContents.openDevTools();
  });
}

function createTestRunnerWindow(): Promise<GitHubElectron.BrowserWindow> {
  return new Promise<GitHubElectron.BrowserWindow>((resolve, reject) => {
    const wnd = createWindow({ isReporter: false });
    // open DevTools from the get go to ease debugging of tests
    wnd.webContents.once('devtools-opened', () => {
      // give the DevTools window a bit of time to get its act together before running the tests
      // to ensure the debugger doesn't miss any breakpoints in the tests
      setTimeout(() => resolve(wnd), 1000);
    });
    wnd.webContents.openDevTools();
  });
}
