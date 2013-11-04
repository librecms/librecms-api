'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.initConfig({
    nodemon: {
      dev: {
        options: {
          env: {
            'LIBRECMS_MONGO_URI': process.env.LIBRECMS_MONGO_URI || 'mongodb://localhost/librecms',
            'LIBRECMS_API_PORT': '3030'
          }
        }
      },
      prod: {
        options: {
          env: {
            'LIBRECMS_MONGO_URI': process.env.LIBRECMS_MONGO_URI || 'mongodb://localhost/librecms',
            'LIBRECMS_API_PORT': '3030'
          }
        }
      }
    }
  });
};
