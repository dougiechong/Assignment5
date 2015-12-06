module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            development: {
                options: {
                    paths: ['public/javascripts/']
                },
                files: {
                    'public/javascripts/global.min.js': 'public/javascripts/global.js',
                    'public/javascripts/locationField.min.js': 'public/javascripts/locationField.js',
                    'public/javascripts/map.min.js': 'public/javascripts/map.js'
                }
            }
        },
        cssmin: {
            development: {
                options: {
                    paths: ['public/stylesheets/']
                },
                files: {
                    'public/stylesheets/style.min.css': 'public/stylesheets/style.css'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
};