# Hydragon

[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)]()

Extensible multi-platform debugger frontend.

# Development

## Prerequisites

- [Node.js](https://nodejs.org/) **6.1.x**
- [NPM](https://www.npmjs.com/) **3.x.x**
- [Bower](http://bower.io/) - `npm install bower -g`
- [Grunt](http://gruntjs.com) - `npm install grunt-cli -g`

## Setup

After cloning this repository run the following commands:

```shell
npm install
npm run build:native-modules
```

Note that the first time you rebuild the native modules it may take a few minutes (and there won't
be any visible indicator that anything is actually happening) because the task is busy downloading
the headers and libs needed to rebuild the modules. If anything actually goes wrong during this
process errors will be displayed in the console.

Once the native modules have been rebuilt you can build the app itself by executing
`npm run build:full` from the root directory, and once built the app can be launched with
`npm start` or `npm run electron`.

## NPM Scripts

- Launch the Hydragon app:

  ```shell
  npm start
  ```
  OR

  ```shell
  npm run electron
  ```
- Compile TypeScript source files in `app/src`:

  ```shell
  npm run build -s
  ```
- Run the `clean` task followed by the `build:full` task:

  ```shell
  npm run build:clean -s
  ```
- Compile TypeScrypt source files, preprocess html templates, vulcanize `app/bower_components`, and
  copy custom element templates to `app/lib`:

  ```shell
  npm run build:full -s
  ```
  This task should really only be run on a fresh checkout or after the `clean` task, otherwise it's
  probably sufficient to run one of the finer grained tasks.
- Rebuild all native Node module in `app/node_modules` dir:

  ```shell
  npm run build:native-modules -s
  ```
  See also [Native NodeJS modules](#native-nodejs-modules).
- Compile TypeScript source files in `tasks` dir to JavaScript:

  ```shell
  npm run build:tasks -s
  ```
  This task is only used when debugging the tasks.
- Delete output generated by the `build:full` task:

  ```shell
  npm run clean
  ```
- Launch the Hydragon app with main process debugging enabled:

  ```shell
  npm run electron:debug
  ```
  See also [Debugging JavaScript in the main process](#debugging-javascript-in-the-main-process).
- Run `tslint` on the TypeScript source files:

  ```shell
  npm run lint -s
  ```
- Launch `node-inspector` for debugging the main process of the Hydragon app:

  ```shell
  npm run node-inspector
  ```
  See also [Debugging JavaScript in the main process](#debugging-javascript-in-the-main-process).
- Bundle the contents of `app/bower_components`:

  ```shell
  npm run vulcanize
  ```
  See also [Custom Elements](#custom-elements).

## Directory Layout

- `app`
  - `bower_components` - Bower components that are used at runtime by the application.
  - `lib` - JavaScript files generated by build process.
  - `node_modules` - Node modules that are used at runtime by the application.
  - `src` - Application source.
  - `static` - Various files that will be loaded by the application at runtime, all files in this
    directory should be ready to use at runtime (if a file needs any kind of pre-processing it
    doesn't belong in here).
  - `typings` - TypeScript type definitions for modules in `node_modules`.
- `tasks` - Tasks used to build, run, and test the application.
- `node_modules` - Node modules used by the build system.
- `typings` - TypeScript type definitions for modules in `node_modules`.

## Debugging JavaScript in the main process

[node-inspector](https://github.com/node-inspector/node-inspector) can be used to debug JavaScript
code running in the main Electron process by following these steps:

1. Start `node-inspector` by running `npm run node-inspector` from the project root directory.
2. Start Hydragon by running `npm run electron:debug`.
3. Open the URL that `node-inspector` prints out in `Chrome`,
   e.g. `http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858`

## Native NodeJS modules

Native NodeJS modules used during the build must be built specifically for the NodeJS version used
by the build system and the various development packages. However, native NodeJS modules used by
Hydragon or any of its dependencies must be built with the same NodeJS SDK version that's integrated
into the Electron runtime.

To that end any NodeJS modules used by the build system must be referenced in the `package.json`
file located in this directory, while any NodeJS modules used by Hydragon at runtime must be
referenced in the `package.json` found in the `app` directory. More background info can be found in
the Electron docs on [native NodeJS modules](https://github.com/electron/electron/blob/v0.37.8/docs/tutorial/using-native-node-modules.md).

To download the NodeJS SDK used to build Electron and rebuild any native modules in
`app/node_modules` execute the following command in the terminal:

```shell
npm run build:native-modules
```

## Custom Elements

There are a number of build tasks associated with the custom elements in
`app/src/renderer-process/elements`, during development you may need to run some or all of them
depending on what which files you're modifying. These tasks can be run in any order.

- `npm run vulcanize` will bundle up the dependencies in `app/bower_components`, this needs to be
  rerun whenever the contents of `app/bower_components` change.
- `npm run preprocess` will preprocess some of the element `.html` files.
- `grunt sync` will copy all the element `.html` files to the `app/lib` directory, this is where the
  app will load them from at runtime.
- `npm run build:renderer` will compile all the element `.ts` files and place the output in the
  `app/lib` directory.


## DevTools Extensions

### Devtron

To install the [Devtron DevTools extension](https://github.com/electron/devtron) launch Hydragon
using `npm start`, then open the Electron DevTools console and run `require('devtron').install()`.
The Devtron extension will now be loaded every time the application is launched, to uninstall the
extension run `require('devtron').uninstall()`.

### React

To install the [React DevTools extension](https://github.com/firejune/electron-react-devtools)
launch Hydragon using `npm start`, then open the Electron DevTools console and run
`require('electron-react-devtools').install()`. The React extension will now be loaded every time
the application is launched, to uninstall the extension run
`require('electron-react-devtools').uninstall()`.

# License

MIT
