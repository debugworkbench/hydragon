// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

shell.cd(path.join(__dirname, '..'));

// Replace the typings in the mobx-react package with ones that are compatible with the tweaked
// React typings used in this project.
shell.cp(
  'app/typings/mobx-react/index.d.ts',
  'app/node_modules/mobx-react/index.d.ts'
);

// Replace the typings in the mobx-react-devtools package with ones that are compatible with the
// tweaked React typings used in this project.
shell.cp(
  'app/typings/mobx-react-devtools/index.d.ts',
  'app/node_modules/mobx-react-devtools/index.d.ts'
);

// Replace the typings in the react-free-style package with ones that work with React 15.3.0.
shell.cp(
  'app/typings/@types/react-free-style/index.d.ts',
  'app/node_modules/react-free-style/dist/react-free-style.d.ts'
);

// Copy typings for untyped NPM packages to somewhere the TypeScript compiler can find
// them automatically without having to manually reference the type definitions.
// It should be possible to avoid this entirely by using the `typeRoots` compiler option,
// but `typeRoots` doesn't seem to work as expected at the moment (nor is it properly documented).

// electron-devtools-installer
shell.mkdir('-p', 'app/node_modules/@types/electron-devtools-installer');
shell.cp(
  'app/typings/@types/electron-devtools-installer/index.d.ts',
  'app/node_modules/@types/electron-devtools-installer'
);

// react-virtualized
shell.mkdir('-p', 'app/node_modules/@types/react-virtualized');
shell.cp(
  'app/typings/@types/react-virtualized/*.d.ts',
  'app/node_modules/@types/react-virtualized'
);

// uuid
shell.mkdir('-p', 'app/node_modules/@types/uuid');
shell.cp(
  'app/typings/@types/uuid/index.d.ts',
  'app/node_modules/@types/uuid'
);
