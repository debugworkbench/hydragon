import * as shell from 'shelljs';
import * as path from 'path';

//shell.cd('app');
//shell.exec('npm install');

// Replace the default typings that ship with mobx-react with ones that are compatible with the
// tweaked React typings used in this project.
shell.cp(
  path.join(__dirname, 'app/typings/mobx-react/index.d.ts'),
  path.join(__dirname, 'app/node_modules/mobx-react/index.d.ts')
);
