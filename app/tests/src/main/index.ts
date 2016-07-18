// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { app } from 'electron';
import { TestEnvironment } from './test-environment';

app.on('ready', () => {
  const env = new TestEnvironment();
  env.onReady(() => env.runTests());
});
