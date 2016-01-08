// This file contains the actual Grunt config which gets imported in Gruntfile.js.

import * as path from 'path';
import * as glob from 'glob';

/** Load Grunt tasks from the .ts files in the tasks directory. */
function loadTasks(grunt: IGrunt): void {
  try {
    const files = glob.sync('*.ts', { cwd: 'tasks' });
    files.forEach((filename) => {
      require('./tasks/' + path.basename(filename, '.ts'))(grunt);
    });
  } catch (e) {
    grunt.log.verbose.error(e.stack).or.error(e);
  }
}

export = function(grunt: IGrunt) {
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ibsforts');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-vulcanize');
  // grunt.loadTasks() only loads .js and .coffee files, so gotta load .ts files separately
  loadTasks(grunt);


  const repoRoot = path.resolve('..');
  const packageJson = grunt.file.readJSON('../package.json');

  const buildServerPlugins = [{
    module: 'ibsforts-plugin-babel',
    transform: 'babelTransform',
    options: {
      enableNodeModuleResolution: true,
      plugins: [
        'transform-strict-mode',
        'transform-es2015-parameters',
        'transform-es2015-destructuring',
        'transform-es2015-spread',
        'transform-polymer-base'
      ]
    }
  }];

  const commonProjectBuildTaskOptions = {
    projectConfigPath: '../src/common/tsconfig.json',
    plugins: buildServerPlugins
  };
  const mainProjectBuildTaskOptions = {
    projectConfigPath: '../src/main-process/tsconfig.json',
    plugins: buildServerPlugins
  };
  const rendererProjectBuildTaskOptions = {
    projectConfigPath: '../src/renderer-process/tsconfig.json',
    plugins: buildServerPlugins
  };

  grunt.initConfig({
    'pkg': packageJson,
    'ibsforts': {
      options: {
        projects: [
          commonProjectBuildTaskOptions,
          mainProjectBuildTaskOptions,
          rendererProjectBuildTaskOptions
        ]
      },
      'common': {
        options: commonProjectBuildTaskOptions
      },
      'main': {
        options: mainProjectBuildTaskOptions
      },
      'renderer': {
        options: rendererProjectBuildTaskOptions
      },
      'build': {
        // this target will build all projects specified in `options.projects`
      },
      'watch': {
        // this target will watch and rebuild all projects specified in `options.projects`
        options: {
          watch: true
        }
      }
    },
    'jshint': {
      files: ['Gruntfile.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    'tslint': {
      errors: {
        options: {
          configuration: grunt.file.readJSON('../conf/tslint.json')
        },
        files: {
          src: [
            'tasks/*.ts',
            '../src/**/*.ts',
            '../test/**/*.ts'
          ]
        }
      }
    },
    'vulcanize': {
      default: {
        options: {
          // extract all inline JavaScript into a separate file to work around Atom's
          // Content Security Policy
          csp: 'dependencies_bundle.js'
        },
        files: {
          // output: input
          '../bower_components/dependencies_bundle.html': '../bower_components/dependencies.html'
        }
      }
    },
    'rebuild-native-modules': {
      default: {
        options: {
          nodeModulesDir: path.join(repoRoot, 'node_modules')
        }
      }
    },
    'run-node-inspector': {
      default: {
        options: {
          scriptPath: path.join(repoRoot, 'node_modules', 'node-inspector', 'bin', 'inspector.js')
        }
      }
    },
    'run-electron': {
      options: {
        cwd: repoRoot,
        scriptPath: path.join('.', 'lib', 'main-process', 'main.js'),
      },
      default: {
        // run Electron normally without debugging
      },
      debug: {
        options: {
          debug: true,
          stopAtEntry: true
        }
      }
    },
    'sync': {
      default: {
        files: [{
          cwd: '../src',
          src: [
            'common/fs-promisified.js'
          ],
          dest: '../lib'
        }]
      },
      elements: {
        files: [{
          cwd: '../src',
          src: [
            'renderer-process/elements/**/*.html',
            '!renderer-process/elements/code-mirror-editor/code-mirror-styles.html'
          ],
          dest: '../lib'
        }],
        verbose: true,
        //pretend: true
      }
    },
    'preprocess': {
      elements: {
        src: '../src/renderer-process/elements/code-mirror-editor/code-mirror-styles.html',
        dest: '../lib/renderer-process/elements/code-mirror-editor/code-mirror-styles.html'
      }
    },
    /*
    'concurrent': {
      default: {
        tasks: [
          'ibsforts:watch'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    }
    */
  });

  grunt.registerTask('lint', ['jshint', 'tslint']);
  // FIXME: need some sort of dependency resolution for build and watch tasks!
  grunt.registerTask('build', ['ibsforts:common', 'ibsforts:main', 'ibsforts:renderer', 'sync:default']);
  grunt.registerTask('watch', ['ibsforts:watch']);
  grunt.registerTask('default', ['lint', 'build']);
};
