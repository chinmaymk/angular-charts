module.exports = function(grunt) {

  grunt.initConfig({
    ngmin: {
      directives: {
        src: ['src/*.js'],
        dest: 'build/directives.js'
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['build/*.js'],
        dest: 'dist/angular-charts.js'
      }
    },
    uglify : {
      dist: {
        src: 'dist/angular-charts.js',
        dest: 'dist/angular-charts.min.js'
      }
    },
    clean : ["build"],
    watch: {
        scripts: {
        files: ['src/**/*.js', 'src/**/*.html'],
        tasks: ['ngmin', 'html2js', 'concat', 'uglify', 'clean'],
        options: {
          debounceDelay: 250,
        },
      }
    },
    html2js: {
      options: {
        base : 'src/templates',
        module : 'angularChartsTemplates',
        rename : function(name) {
          return name.replace('.html', '');
        }
      },
      main: {
        src: ['src/templates/*.html'],
        dest: 'build/templates.js'
      },
    },
    update_json: {
      bower: {
        src: 'package.json',
        dest: 'bower.json',
        fields: ['name', 'version', 'description', 'repository']
      }
    },
    copy: {
      bower_release_pre: {
        files: [
          { src: 'dist/angular-charts.js', dest: 'dist/angular-charts.tmp.js' },
          { src: 'dist/angular-charts.min.js', dest: 'dist/angular-charts.min.tmp.js' }
        ]
      }
    },
    shell: {
      bower_release: {
        command: [
          'git checkout bower',
          'git checkout master -- bower.json',
          'mv -f dist/angular-charts.tmp.js dist/angular-charts.js',
          'mv -f dist/angular-charts.min.tmp.js dist/angular-charts.min.js',
        ]
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['ngmin', 'html2js', 'concat', 'uglify', 'clean']);
  grunt.registerTask('release', ['default', 'update_json', 'bower_release_pre', 'bower_release']);
  
};
