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
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-tsc');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-vulcanize');
  // grunt.loadTasks() only loads .js and .coffee files, so gotta load .ts files separately
  loadTasks(grunt);


  const repoRoot = path.resolve('..');
  const packageJson = grunt.file.readJSON('../package.json');

  grunt.initConfig({
    'pkg': packageJson,
    'babel-plus': {
      default: {
        files: [{
          expand: true,
          cwd: '../intermediate/',
          src: [
            'common/**/*.js',
            'main-process/**/*.js',
            'renderer-process/**/*.js'
          ],
          dest: '../lib/'
        }]
      }
    },
    'babel-plus-watch': {
      options: {
        babelSrcDir: '../intermediate/', //path.join(repoRoot, 'intermediate'),
        babelOutDir: '../lib/' //path.join(repoRoot, 'lib')
      },
      default: {}
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
    'tsc': {
      options: {
        tscPath: path.resolve('node_modules', 'typescript', 'bin', 'tsc')
      },
      'common': {
        options: {
          project: '../src/common/'
        }
      },
      'watch-common': {
        options: {
          project: '../src/common/',
          tscOptions: ['--watch']
        }
      },
      'main': {
        options: {
          project: '../src/main-process/'
        }
      },
      'watch-main': {
        options: {
          project: '../src/main-process/',
          tscOptions: ['--watch']
        }
      },
      'renderer': {
        options: {
          project: '../src/renderer-process/'
        }
      },
      'watch-renderer': {
        options: {
          project: '../src/renderer-process/',
          tscOptions: ['--watch']
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
          dest: '../intermediate'
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
    'concurrent': {
      default: {
        tasks: [
          'tsc:watch-common',
          'tsc:watch-main',
          'tsc:watch-renderer',
          'babel-plus-watch:default'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.registerTask('lint', ['jshint', 'tslint']);
  grunt.registerTask('build', ['tsc:common', 'tsc:main', 'tsc:renderer', 'sync:default', 'babel-plus:default']);
  grunt.registerTask('watch', ['concurrent:default']);
  grunt.registerTask('default', ['lint', 'build']);
};
