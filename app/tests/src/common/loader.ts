// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Module } from 'module';
import * as path from 'path';
import { decodeFromUriComponent } from './window-config';

// Remap module paths of the form `app/**` to `../../../lib/**` so that imports in the test modules
// can be written more concisely. This monkey patch takes care of the module resolution at runtime,
// the TypeScript end of things is handled using the `baseUrl` and `paths` settings in the
// `tsconfig.json`.
const oldResolveFilename = Module._resolveFilename;
const appBasePath = path.resolve(__dirname, '../../../lib');
Module._resolveFilename = function (request: string, ...rest: any[]) {
  return oldResolveFilename(
    request.startsWith('app/') ? path.join(appBasePath, request.slice('app'.length)) : request,
    ...rest
  );
};

if (process.type === 'browser') {
  require('../main');
} else if (process.type === 'renderer') {
  const windowConfig = decodeFromUriComponent(window.location.hash.substr(1));
  if (windowConfig.isReporter) {
    require('../renderer/reporter');
  } else {
    require('../renderer/runner');
  }
} else {
  throw new Error('This module must be loaded by Electron!');
}
