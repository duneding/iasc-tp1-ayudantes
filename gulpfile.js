var gulp    = require('gulp');
var rename  = require('gulp-rename');
var jshint  = require('gulp-jshint');
//var uglify  = require('gulp-uglify');
/*var bower   = require('bower');
var sh      = require('shelljs');
var gutil   = require('gulp-util');
*/

var paths = {
  js: ['./*.js']
};

gulp.task('default', ['lint']); //, 'minify', 'sass', 'images'

// Lint JS
gulp.task('lint', function() {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
/*
gulp.task('minify', function(){
  return gulp.src(paths.js)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('www/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('www/js'));
});
*/


gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint']); //, 'minify'
});

/*gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});*/
