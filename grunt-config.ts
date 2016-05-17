// This file contains the actual Grunt config which gets imported in Gruntfile.js.

import * as path from 'path';
import * as glob from 'glob';

export = function(grunt: IGrunt) {
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-sync');

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
