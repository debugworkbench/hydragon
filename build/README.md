# Hydragon Build System

## NodeJS modules

Native NodeJS modules used during the build must be built specifically for the NodeJS version used
to run Grunt etc. However, native NodeJS modules used by Hydragon or any of its dependencies must
be built with the same NodeJS SDK version that was used to build the Electron runtime.
To that end any NodeJS modules used by the build system must be referenced in the `package.json`
file located in this folder, while any NodeJS modules used by Hydragon at runtime must be
referenced in the `package.json` at the root of this repo. More background info can be found in
the Electron docs on [native NodeJS modules](https://github.com/atom/electron/blob/v0.35.4/docs/tutorial/using-native-node-modules.md).

The `Gruntfile` in this folder has tasks to download the NodeJS SDK used to build Electron, and
rebuild any native modules found in the `node_modules` folder at the root of this repo, it can be
run using `grunt rebuild-native-modules`.

## Custom Elements

There are a number of build tasks associated with the elements in `src/renderer-process/elements`,
during development you may need to run some or all of them depending on what which files you're
modifying. These tasks can be run in any order.

- `grunt vulcanize` will bundle up the dependencies in `bower_components`, this needs to be rerun
  whenever the contents of `bower_components` change.
- `grunt preprocess` will preprocess some of the element `.html` files.
- `grunt sync` will copy all the element `.html` files to the `lib` directory, this is where the
  app will load them from at runtime.
- `grunt build` will compile all the element `.ts` files and place the output in the `lib` directory.
