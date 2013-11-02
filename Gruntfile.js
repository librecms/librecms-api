'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.initConfig({
    nodemon: {
      dev: {
        options: {
          env: {
            'LIBRECMS_MONGO_URI': 'mongodb://localhost/librecms'
          }
        }
      },
      prod: {
        options: {
          env: {
            'LIBRECMS_MONGO_URI': process.env.LIBRECMS_MONGO_URI || 'mongodb://localhost/librecms'
          }
        }
      }
    }
  });
};
