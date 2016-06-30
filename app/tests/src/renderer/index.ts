// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ipcRenderer } from 'electron';
import * as Mocha from 'mocha';
import { ReportGenerator } from './report-generator';
import { MochaIPCBridge } from './mocha-ipc-bridge';
import { MochaReporter } from './reporter';
import { channels, ITestRunOptions } from '../common/mocha-ipc';

declare global {
  interface Mocha {
    reporter(reporter: MochaReporter, options: MochaReporter.IOptions): Mocha;
  }
}

const reportGenerator = new ReportGenerator();
const mochaBridge = new MochaIPCBridge(reportGenerator);

ipcRenderer.on(channels.RENDERER_MOCHA_RUN,
  (event: GitHubElectron.IRendererIPCEvent, options: ITestRunOptions) => {
    // clear out the test file from the require cache to work around a Mocha "feature" where it
    // skips running tests from a file that was previously loaded by any other Mocha instance in
    // this process
    delete require.cache[options.file];
    new Mocha()
    .addFile(options.file)
    .grep(new RegExp(options.grep, options.grepFlags))
    .reporter(MochaReporter, { reportGenerator })
    .run(failureCount => ipcRenderer.send(channels.RENDERER_MOCHA_RUN_END, failureCount));
});
