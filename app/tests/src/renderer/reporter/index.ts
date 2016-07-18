// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { ReportGenerator } from './report-generator';
import { MochaIPCBridge } from './mocha-ipc-bridge';

const reportGenerator = new ReportGenerator();
const mochaBridge = new MochaIPCBridge(reportGenerator);
