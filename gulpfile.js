var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var preprocess = require('gulp-preprocess');
var argv = require('yargs').argv;
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');

var defaults = require('./env.json');
var env = argv.env ? require('./' + argv.env) : defaults;

var paths = {
  scripts: ['src/js/**/*.js', '!src/js/vendor/**/*.js'],
  styles: ['src/styl/*.styl'],
};

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(preprocess({context: env}))
    .pipe(gulp.dest('www/'));
});

gulp.task('styl', function() {
  return gulp.src(paths.styles)
    .pipe(stylus())
    .pipe(gulp.dest('www/css/'));
});

gulp.task('scripts', function() {
  var bundleStream = browserify('./src/js/main.js', {debug: true}).bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./www'));
});

gulp.task('prod-scripts', function() {
  var bundleStream = browserify('./src/js/main.js').bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www'));
});

gulp.task('watch-scripts', function() {
  var opts = watchify.args;
  opts.debug = true;

  var bundleStream = watchify(browserify('./src/js/main.js', opts));

  function rebundle() {
    return bundleStream.bundle()
      .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
      .pipe(source('app.js'))
      .pipe(gulp.dest('./www'));
  }

  bundleStream.on('update', rebundle);
  bundleStream.on('log', gutil.log);

  return rebundle();
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['styl']);
  gulp.watch('src/index.html', ['html']);
});

gulp.task('dev', ['html', 'styl', 'scripts']);
gulp.task('dev-watch', ['html', 'styl', 'watch-scripts', 'watch']);
gulp.task('prod', ['html', 'styl', 'prod-scripts']);

// Default Task
gulp.task('default', ['dev-watch']);
