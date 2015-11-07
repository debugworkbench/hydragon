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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-tsc');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-vulcanize');
  // grunt.loadTasks() only loads .js and .coffee files, so gotta load .ts files separately
  loadTasks(grunt);


  const repoRoot = path.resolve('..');
  const packageJson = grunt.file.readJSON('../package.json');
  // Set the Grunt working directory to the root of the repo so that any relative paths passed
  // to Grunt from here on are resolved relative to root dir instead of the build dir.
  grunt.file.setBase(repoRoot);

  grunt.initConfig({
    'pkg': packageJson,
    'jshint': {
      files: ['build/Gruntfile.js'],
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
          configuration: grunt.file.readJSON('conf/tslint.json')
        },
        files: {
          src: [
            'build/tasks/*.ts',
            'src/**/*.ts',
            'test/**/*.ts'
          ]
        }
      }
    },
    'tsc': {
      options: {
        tscPath: path.resolve('build', 'node_modules', 'typescript', 'bin', 'tsc')
      },
      'main-process': {
        options: {
          project: 'src/main-process'
        }
      },
      'renderer-process': {
        options: {
          project: 'src/renderer-process'
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
          'lib/renderer-process/elements/dependencies_bundle.html': 'src/renderer-process/elements/dependencies.html'
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
        scriptPath: path.join(repoRoot, 'lib', 'main-process', 'main.js')
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
      elements: {
        files: [{
          cwd: 'src',
          src: [
            'renderer-process/elements/**/*.html',
            '!renderer-process/elements/dependencies.html'
          ],
          dest: 'lib'
        }],
        verbose: true,
        //pretend: true
      }
    }
  });

  grunt.registerTask('lint', ['jshint', 'tslint']);
  grunt.registerTask('build', ['tsc']);
  grunt.registerTask('default', ['lint', 'build']);
};
