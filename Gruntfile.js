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
        files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css'],
        tasks: ['ngmin', 'htmlmin', 'html2js', 'csso', 'css2js', 'concat', 'uglify', 'clean'],
        options: {
          debounceDelay: 250,
        },
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeComments: true
        },
        files: {
          'build/right.min.html': 'src/templates/right.html',
          'build/left.min.html': 'src/templates/left.html',
        }
      }
    },
    html2js: {
      options: {
        base : 'build',
        module : 'angularChartsTemplates',
        rename : function(name) {
          return 'angularChartsTemplate_' + name.replace('.min.html', '');
        }
      },
      main: {
        src: ['build/*.min.html'],
        dest: 'build/templates.js'
      },
    },

    // CSS -> minfied CSS -> JS.
    csso: {
      main: {
        files: {
          'build/styles.min.css': ['src/styles.css']
        }
      }
    },
    css2js: {
      main: {
        src: 'build/styles.min.css',
        dest: 'build/styles.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    prompt: {
      release: {
        options: {
          questions: [
            {
              config: 'release', // arbitray name or config for any other grunt task
              type: 'confirm', // list, checkbox, confirm, input, password
              message: 'Are you sure?', // Question to ask the user, function needs to return a string,
              default: false // default value if nothing is entered
            }
          ]
        }
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

  grunt.registerTask('default', ['ngmin', 'htmlmin', 'html2js', 'csso', 'css2js', 'concat', 'uglify', 'clean', 'karma']);
  grunt.registerTask('release', ['karma', 'prompt', 'bowerValidateRelease']);

  grunt.registerTask('bowerValidateRelease', 'Make sure that we really want to release!', function() {
    if(grunt.config('release') === true) {
      grunt.task.run('default', 'copy:bowerPreRelease', 'shell:bowerRelease');
    }
  });

};
