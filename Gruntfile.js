/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner: '// Backbone.Select, v<%= meta.version %>\n' +
        '// Copyright (c) <%= grunt.template.today("yyyy") %> Michael Heim\n' +
        '//           (c) 2013 Derick Bailey, Muted Solutions, LLC.\n' +
        '// Distributed under MIT license\n' +
        '// http://github.com/hashchange/backbone.select\n' +
        '\n'
    },

    preprocess: {
      // Currently works as a copy
      build: {
        files: {
          'lib/backbone.select.js' : 'src/backbone.select.js'
        }
      },
      amd: {
        files: {
          'lib/amd/backbone.select.js' : 'src/amd.js'
        }
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        src: 'lib/backbone.select.js',
        dest: 'lib/backbone.select.js'
      },
      amd_banner: {
        src: 'lib/amd/backbone.select.js',
        dest: 'lib/amd/backbone.select.js'
      }
    },

    uglify : {
      options: {
        banner: "<%= meta.banner %>"
      },
      amd : {
        src : 'lib/amd/backbone.select.js',
        dest : 'lib/amd/backbone.select.min.js',
      },
      core : {
        src : 'lib/backbone.select.js',
        dest : 'lib/backbone.select.min.js',
        options : {
          sourceMap : 'lib/backbone.select.map',
          sourceMappingURL : 'backbone.select.map',
          sourceMapPrefix : 1
        }
      }
    },

    jasmine : {
      options : {
        helpers : 'spec/javascripts/helpers/*.js',
        specs : 'spec/javascripts/**/*.spec.js',
        vendor : [
          'public/javascripts/underscore.js',
          'public/javascripts/backbone.js'
        ],
      },
      coverage : {
        src : 'src/backbone.select.js',
        options : {
          template : require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'reports/coverage.json',
            report: 'reports/coverage'
          }
        }
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      component : 'src/backbone.select.js'
    },

    plato: {
      component : {
        src : 'src/*.js',
        dest : 'reports',
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-plato');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine', 'preprocess', 'concat', 'uglify']);

};
