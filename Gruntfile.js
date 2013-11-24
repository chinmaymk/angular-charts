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
          return name.replace('.html', '')
        }
      },
      main: {
        src: ['src/templates/*.html'],
        dest: 'build/templates.js'
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('default', ['ngmin', 'html2js', 'concat', 'uglify', 'clean']);
  
};
