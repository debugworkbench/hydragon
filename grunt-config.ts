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


  const repoRoot = __dirname;
  const packageJson = grunt.file.readJSON('./package.json');

  const buildServerPlugins = [{
    module: 'ibsforts-plugin-babel',
    transform: 'babelTransform',
    options: {
      enableNodeModuleResolution: true,
      plugins: [
        'transform-es2015-parameters',
        'transform-es2015-destructuring',
        'transform-polymer-base'
      ]
    }
  }];

  const commonProjectBuildTaskOptions = {
    projectConfigPath: 'app/src/common/tsconfig.json',
    plugins: buildServerPlugins
  };
  const mainProjectBuildTaskOptions = {
    projectConfigPath: 'app/src/main/tsconfig.json',
    plugins: buildServerPlugins
  };
  const rendererProjectBuildTaskOptions = {
    projectConfigPath: 'app/src/renderer/tsconfig.json',
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
          configuration: grunt.file.readJSON('app/conf/tslint.json')
        },
        files: {
          src: [
            'tasks/*.ts',
            'app/src/**/*.ts',
            'test/**/*.ts'
          ]
        }
      }
    },
    'vulcanize': {
      default: {
        options: {
          // extract all inline JavaScript into a separate file to work around Atom's
          // Content Security Policy
          csp: 'dependencies_bundle.js',
          // files matching these patterns will not be bundled
          stripExcludes: [
            // it's got nasty shadow DOM piercing combinators in it
            'iron-shadow-flex-layout.html'
          ]
        },
        files: {
          // output: input
          'app/bower_components/dependencies_bundle.html': 'app/bower_components/dependencies.html'
        }
      }
    },
    'rebuild-native-modules': {
      default: {
        options: {
          nodeModulesDir: path.join(repoRoot, 'app', 'node_modules')
        }
      }
    },
    'run-node-inspector': {
      default: {
        options: {
          scriptPath: path.join(repoRoot, 'app', 'node_modules', 'node-inspector', 'bin', 'inspector.js')
        }
      }
    },
    'run-electron': {
      options: {
        cwd: repoRoot,
        scriptPath: path.join('app', 'lib', 'main', 'main.js'),
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
          cwd: 'app/src',
          src: [
            'renderer/elements/**/*.html',
            '!renderer/elements/code-mirror-editor/code-mirror-styles.html'
          ],
          dest: 'app/lib'
        }],
        verbose: true,
        //pretend: true
      }
    },
    'preprocess': {
      elements: {
        src: 'app/src/renderer/elements/code-mirror-editor/code-mirror-styles.html',
        dest: 'app/lib/renderer/elements/code-mirror-editor/code-mirror-styles.html'
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
  grunt.registerTask('build', ['ibsforts:common', 'ibsforts:main', 'ibsforts:renderer']);
  grunt.registerTask('watch', ['ibsforts:watch']);
  grunt.registerTask('default', ['lint', 'build']);
};
