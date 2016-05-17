// This file contains the actual Grunt config which gets imported in Gruntfile.js.

import * as path from 'path';
import * as glob from 'glob';

export = function(grunt: IGrunt) {
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-vulcanize');

  const repoRoot = __dirname;
  const packageJson = grunt.file.readJSON('./package.json');

  grunt.initConfig({
    'pkg': packageJson,
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

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['lint']);
};
