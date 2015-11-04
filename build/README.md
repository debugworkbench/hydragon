# Hydragon Build System

## NodeJS modules

Native NodeJS modules used during the build must be built specifically for the NodeJS version used
to run Grunt etc. However, native NodeJS modules used by Hydragon or any of its dependencies must
be built with the same NodeJS SDK version that was used to build the Electron runtime.
To that end any NodeJS modules used by the build system must be referenced in the `package.json`
file located in this folder, while any NodeJS modules used by Hydragon at runtime must be
referenced in the `package.json` at the root of this repo. More background info can be found in
the Electron docs on [native NodeJS modules](https://github.com/atom/electron/blob/v0.34.2/docs/tutorial/using-native-node-modules.md).

The `Gruntfile` in this folder has tasks to download the NodeJS SDK used to build Electron, and
rebuild any native modules found in the `node_modules` folder at the root of this repo.
