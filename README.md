# Hydragon

Extensible multi-platform debugger frontend.

# Development

## Prerequisites

- [Node.js](https://nodejs.org/) **6.1.x**
- [NPM](https://www.npmjs.com/) **3.x.x**
- [Bower](http://bower.io/) - `npm install bower -g`
- [Grunt](http://gruntjs.com) - `npm install grunt-cli -g`

## Setup

After cloning this repository install the depedencies:

```shell
cd app
npm install
bower install
```

Then setup the build system:

```shell
cd ..
npm install
grunt rebuild-native-modules
```

Note that the first time you rebuild the native modules it may take a few minutes (and there won't
be any visible indicator that anything is actually happening) because the task is busy downloading
the headers and libs needed to rebuild the modules. If anything actually goes wrong during this
process errors will be displayed in the console.

Once the native modules have been rebuilt you can build the app itself by executing `grunt` from
the root directory, and once built the app can be launched with `npm start` or `grunt run-electron`.

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
- `tasks` - Grunt tasks used to build, run, and test the application.
- `node_modules` - Node modules used by the Grunt tasks.
- `typings` - TypeScript type definitions for modules in `node_modules`.

## Debugging JavaScript in the main process

[node-inspector](https://github.com/node-inspector/node-inspector) can be used to debug JavaScript
code running in the main Electron process by following these steps:

1. Start `node-inspector` by running `grunt run-node-inspector` from the project root directory.
2. Start Hydragon by running `grunt run-electron:debug`.
3. Open the URL that `node-inspector` prints out in `Chrome`,
   e.g. `http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858`

## NodeJS modules

Native NodeJS modules used during the build must be built specifically for the NodeJS version used
to run Grunt etc. However, native NodeJS modules used by Hydragon or any of its dependencies must
be built with the same NodeJS SDK version that was used to build the Electron runtime.
To that end any NodeJS modules used by the build system must be referenced in the `package.json`
file located in this folder, while any NodeJS modules used by Hydragon at runtime must be
referenced in the `package.json` at the root of this repo. More background info can be found in
the Electron docs on [native NodeJS modules](https://github.com/atom/electron/blob/v0.35.4/docs/tutorial/using-native-node-modules.md).

The `Gruntfile` in this folder has tasks to download the NodeJS SDK used to build Electron, and
rebuild any native modules found in `app/node_modules`, it can be run using:

```shell
grunt rebuild-native-modules
```

## Custom Elements

There are a number of build tasks associated with the elements in `app/src/renderer-process/elements`,
during development you may need to run some or all of them depending on what which files you're
modifying. These tasks can be run in any order.

- `grunt vulcanize` will bundle up the dependencies in `app/bower_components`, this needs to be rerun
  whenever the contents of `app/bower_components` change.
- `grunt preprocess` will preprocess some of the element `.html` files.
- `grunt sync` will copy all the element `.html` files to the `app/lib` directory, this is where the
  app will load them from at runtime.
- `grunt build` will compile all the element `.ts` files and place the output in the `app/lib` directory.


# License

MIT
