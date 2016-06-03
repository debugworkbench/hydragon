import * as shell from 'shelljs';
import * as path from 'path';

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
