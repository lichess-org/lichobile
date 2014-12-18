var source = require('vinyl-source-stream');
var minimist = require('minimist');
var gulpif = require('gulp-if');
var gulp = require('gulp');
var gutil = require('gulp-util');
var preprocess = require('gulp-preprocess');
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var streamify = require('gulp-streamify');

// command line options
var minimistOptions = {
  string: ['env', 'mode'],
  default: { env: 'env.json', mode: 'dev' }
};
var options = minimist(process.argv.slice(2), minimistOptions);

var paths = {
  scripts: ['src/js/**/*.js', '!src/js/vendor/**/*.js'],
  styles: ['src/styl/reset.styl', 'src/styl/*.styl'],
};

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(preprocess({context: require('./' + options.env)}))
    .pipe(gulp.dest('www/'));
});

gulp.task('styl', function() {
  return gulp.src(paths.styles)
    .pipe(stylus())
    .pipe(concat('app.css'))
    .pipe(gulpif(options.mode === 'prod', minifyCss()))
    .pipe(gulp.dest('www/css/compiled/'));
});

gulp.task('scripts', function() {
  var opts = (options.mode === 'prod') ? {} : { debug: true };
  var bundleStream = browserify('./src/js/main.js', opts).bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('app.js'))
    .pipe(gulpif(options.mode === 'prod', streamify(uglify())))
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
gulp.task('launch-watch', function() {
  gulp.watch(paths.styles, ['styl']);
  gulp.watch('src/index.html', ['html']);
});

gulp.task('default', ['html', 'styl', 'scripts']);
gulp.task('watch', ['html', 'styl', 'watch-scripts', 'launch-watch']);
