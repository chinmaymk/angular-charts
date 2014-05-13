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
    copy: {
      bowerPreRelease: {
        files: [
          { src: 'dist/angular-charts.js', dest: 'dist/angular-charts.tmp.js' },
          { src: 'dist/angular-charts.min.js', dest: 'dist/angular-charts.min.tmp.js' }
        ]
      }
    },
    shell: {
      bowerRelease: {
        command: [
          'git checkout bower',
          'git checkout master -- bower.json',
          'mv -f dist/angular-charts.tmp.js dist/angular-charts.js',
          'mv -f dist/angular-charts.min.tmp.js dist/angular-charts.min.js',
          "git commit -am 'release <%= pkg.version %>'",
          'git tag <%= pkg.version %>'
        ].join('&&')
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['ngmin', 'html2js', 'concat', 'uglify', 'clean']);
  grunt.registerTask('release', ['default', 'copy:bowerPreRelease', 'shell:bowerRelease']);
  
};
