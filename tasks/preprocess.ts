// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { preprocessFileSync } from 'preprocess';

// This script should only be invoked from the project root directory.

const context = {};

preprocessFileSync(
  './app/src/renderer/elements/code-mirror-editor/code-mirror-styles.html',
  './app/lib/renderer/elements/code-mirror-editor/code-mirror-styles.html',
  context
);
