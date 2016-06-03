import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

//shell.cd('app');
//shell.exec('npm install');

// Replace the typings in the mobx-react package with ones that are compatible with the tweaked
// React typings used in this project.
shell.cp(
  path.join(__dirname, 'app/typings/mobx-react/index.d.ts'),
  path.join(__dirname, 'app/node_modules/mobx-react/index.d.ts')
);

// Replace the typings in the mobx-react-devtools package with ones that are compatible with the
// tweaked React typings used in this project.
shell.cp(
  path.join(__dirname, 'app/typings/mobx-react-devtools/index.d.ts'),
  path.join(__dirname, 'app/node_modules/mobx-react-devtools/index.d.ts')
);

// Replace the typings in the react-free-style package with ones that are compatible with the
// tweaked React typings used in this project.
shell.cp(
  path.join(__dirname, 'app/typings/react-free-style/react-free-style.d.ts'),
  path.join(__dirname, 'app/node_modules/react-free-style/dist/react-free-style.d.ts')
);

// Inject typings into the react-virtualized package.
shell.cp(
  path.join(__dirname, 'app/typings/react-virtualized/*.d.ts'),
  path.join(__dirname, 'app/node_modules/react-virtualized/dist/commonjs')
);
const pkgFilename = path.join(__dirname, 'app/node_modules/react-virtualized/package.json');
const pkg = require(pkgFilename);
pkg.typings = 'dist/commonjs/index.d.ts';
fs.writeFileSync(pkgFilename, JSON.stringify(pkg, null, 2), 'utf8');
