var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');
var preprocess = require('gulp-preprocess');

var env = require('./env.json');

var paths = {
  scripts: ['src/js/**/*.js', '!src/js/vendor/**/*.js']
};

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(preprocess({context: env}))
    .pipe(gulp.dest('www/'));
});

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
  return gulp.src('src/js/app.js')
    .pipe(browserify({
      insertGlobals : false,
      debug : true
    }))
    .pipe(gulp.dest('www/'));
});

gulp.task('dev', ['html', 'lint', 'scripts']);

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint', 'scripts']);
});

// Default Task
gulp.task('default', ['dev', 'watch']);
