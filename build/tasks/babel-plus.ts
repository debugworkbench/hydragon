// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

'use strict';

import * as path from 'path';
import * as chokidar from 'chokidar';
import * as _ from 'lodash';
import * as babel from 'babel-core';
import * as fs from 'fs';
import * as SourceMap from 'source-map';

// manually load all the necessary transform plugins to bypass Babel's module path resolution
const babelTransformStrictModePlugin = require('babel-plugin-transform-strict-mode');
const babelTransformParametersPlugin = require('babel-plugin-transform-es2015-parameters');
const babelTransformDestructuringPlugin = require('babel-plugin-transform-es2015-destructuring');
const babelTransformSpreadPlugin = require('babel-plugin-transform-es2015-spread');
const babelTransformPolymerBasePlugin = require('babel-plugin-transform-polymer-base').default;

interface ITaskOptions {
  /** Absolute path to root directory of source files that will be transformed by Babel. */
  babelSrcDir: string;
  /** Absolute path to root directory where files transformed by Babel will written to. */
  babelOutDir: string;
}

function writeFile(filePath: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      err ? reject(err) : resolve();
    });
  });
}

function readFile(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

type LogFunction = (text: string) => void;

function isSourceMappingURLComment(comment: string): boolean {
  return /^\# sourceMappingURL\=/.test(comment);
}

function loadSourceMapFromFile(file: string): Promise<SourceMap.RawSourceMap> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  })
  .then((data) => JSON.parse(data));
}

/**
 * Transform the given `.js` file with Babel.
 *
 * @param filePath Path to `.js` file to transform (absolute or relative).
 * @param sourceMap Original source map for [[file]], Babel will create a new source map based
 *                  on this one after transforming [[file]].
 * @return Output produced by Babel which includes the transformed source, and a new source map.
 */
function transformFile(filePath: string, sourceMap: SourceMap.RawSourceMap): Promise<babel.IResult> {
  const options: babel.IOptions = {
    babelrc: false,
    plugins: [
      babelTransformStrictModePlugin,
      babelTransformParametersPlugin,
      babelTransformDestructuringPlugin,
      babelTransformSpreadPlugin,
      babelTransformPolymerBasePlugin
    ],
    sourceRoot: sourceMap.sourceRoot,
    sourceFileName: sourceMap.sources[0],
    sourceMapTarget: sourceMap.file,
    inputSourceMap: sourceMap,
    shouldPrintComment: comment => !isSourceMappingURLComment(comment)
  };

  return new Promise<babel.IResult>((resolve, reject) => {
    babel.transformFile(filePath, options, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

/**
 * Write the code and source map in the given Babel result to disk.
 *
 * @param filePath The path to which the code should be written to (absolute or relative),
 *                 the source map will be written to a file at the same path (but with an
 *                 additional `.map` suffix).
 * @param result Output from Babel, expected to have both `code` and `map` fields.
 */
function writeBabelResultToFile(filePath: string, result: babel.IResult, log?: LogFunction): Promise<void> {
  const fileName = path.basename(filePath);
  const sourceMappingURL = result.map ? `\n//# sourceMappingURL=${fileName}.map` : '';
  const code = result.map ? (result.code + sourceMappingURL) : result.code;
  return writeFile(filePath, code)
  .then(() => {
    if (log) {
      log(`Generated ${filePath}`);
    }
    if (result.map) {
      writeFile(filePath + '.map', JSON.stringify(result.map));
      log(`Generated ${filePath}.map`);
    }
  });
}

/**
 * Transform a bunch of `.js` files with Babel.
 *
 * @param files Array of items containing path information, each item must contain a `srcPath`
 *              which is a path to a `.js` file, and a `destPath` which is a path to which
 *              the transformed `.js` file will be written to. Note that paths can be
 *              absolute or relative to the current directory.
 */
function transformFiles(files: Array<{ srcPath: string, destPath: string }>, log?: LogFunction): Promise<void> {
  const promises: Promise<void>[] = files.map(file => {
    return readFile(file.srcPath + '.map')
    .then(sourceMapString => JSON.parse(sourceMapString))
    .then(sourceMap => transformFile(file.srcPath, sourceMap))
    .then(result => writeBabelResultToFile(file.destPath, result, log));
  });
  return Promise.all(promises).then(() => Promise.resolve());
}

function isPathIgnoredByWatcher(filePath: string, stats?: fs.Stats): boolean {
  // This function ends up getting called twice for every path "by design"
  // (assuming the result of the first invocation is `false`), the first time
  // it's invoked `stats` is not provided. Since we need `stats` to figure out
  // if the path is a directory or not we have to wait until the second invocation
  // to figure out what to do with the path.
  if (!stats) {
    return false;
  }

  return !stats.isDirectory() && !_(filePath).endsWith('.js');
}

function activatePlugin(grunt: IGrunt) {
  // This task transforms JavaScript files with Babel (source maps included, and currently
  // required). Source maps are expected to be found right next to the JavaScript files,
  // inline source maps are currently not supported.
  grunt.registerMultiTask('babel-plus', 'Transform .js files with Babel', function () {
    const task: grunt.task.IMultiTask<any> = this;
    const options = task.options<ITaskOptions>(<any> {});
    const done = task.async();

    const files = task.files.map(fileConfig => {
      return {
        srcPath: fileConfig.src[0],
        destPath: fileConfig.dest
      };
    });

    const log: LogFunction = grunt.log.writeln.bind(grunt.log);
    transformFiles(files, log)
    .then(() => done())
    .catch(error => {
      grunt.log.error(error);
      done(false)
    });
  });

  // This task sets up a file system watcher that transforms all the JavaScript files in the
  // watched directory with Babel (source maps included, and currently required). The directory
  // to be watched should be specified in the `babelSrcDir` option, and the output directory
  // where the transformed files will be written to should be specified in the `babelOutDir`
  // option.
  grunt.registerMultiTask('babel-plus-watch', 'Watch a directory and transform any .js files with Babel', function () {
    const task: grunt.task.ITask = this;
    const options = task.options<ITaskOptions>(<any> {});
    const done = task.async();

    function toSrcDestPair(filePath: string) {
      return {
        srcPath: filePath,
        destPath: path.resolve(options.babelOutDir, path.relative(options.babelSrcDir, filePath))
      };
    }

    let isWatcherReady = false;
    const log: LogFunction = grunt.log.writeln.bind(grunt.log);
    const watchOptions: chokidar.WatchOptions = {
      ignored: isPathIgnoredByWatcher,
      ignorePermissionErrors: true
    };
    const watcher = chokidar.watch(options.babelSrcDir, {  })
    .on('ready', () => {
      isWatcherReady = true;
      log(`Watching '${options.babelSrcDir}' ...`);
    })
    .on('add', file => {
      //log('Add FILE ' + file);
      if (isWatcherReady) {
        transformFiles([toSrcDestPair(file)], log)
        .catch(error => grunt.log.error(error));
      }
    })
    .on('addDir', (dir) => grunt.log.writeln('Add DIR ' + dir))
    .on('unlinkDir', (dir) => grunt.log.writeln('Remove DIR ' + dir))
    .on('change', (fileOrDir, stats) => {
      //log('CHANGED ' + fileOrDir);
      if (isWatcherReady && stats && stats.isFile()) {
        transformFiles([toSrcDestPair(fileOrDir)], log)
        .catch(error => grunt.log.error(error));
      }
    })
    .on('error', (e) => {
      grunt.log.verbose.error(e.stack).or.error(e.message);
      done(false);
    });
  });
}

export = activatePlugin;
