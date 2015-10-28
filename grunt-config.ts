// This file contains the actual Grunt config which gets imported in Gruntfile.js.

import * as path from 'path';

export = function(grunt: IGrunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
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
          configuration: grunt.file.readJSON('conf/tslint.json')
        },
        files: {
          src: [
            'src/**/*.ts',
            'test/**/*.ts'
          ]
        }
      }
    },
    'tsc': {
      options: {
        tscPath: path.resolve('node_modules', 'typescript', 'bin', 'tsc')
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
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-tsc');
  grunt.loadNpmTasks('grunt-tslint');
  
  grunt.registerTask('lint', ['jshint', 'tslint']);
  
  grunt.registerTask('build', ['tsc']);
  
  grunt.registerTask('default', ['lint', 'build']);
};
