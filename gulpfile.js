var path = require('path');
var source = require('vinyl-source-stream');
var minimist = require('minimist');
var gulp = require('gulp');
var gutil = require('gulp-util');
var preprocess = require('gulp-preprocess');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var tsify = require('tsify');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer')

// command line options
var minimistOptions = {
  string: ['env', 'mode', 'target'],
  default: {
    env: 'env.json',
    mode: 'dev',
    target: 'browser'
  }
};
var options = minimist(process.argv.slice(2), minimistOptions);

var paths = {
  styles: ['src/styl/reset.styl', 'src/styl/common.styl', 'src/styl/form.styl',
    'src/styl/overlay.styl', 'src/styl/overlay-popup.styl', 'src/styl/*.styl'
  ]
};

function buildHtml(src, dest, context) {
  console.log(context);
  return gulp.src(path.join(src, 'index.html'))
    .pipe(preprocess({context: context}))
    .pipe(gulp.dest(dest));
}

function buildStyl(src, dest, mode) {
  return gulp.src(src)
    .pipe(stylus({
      compress: mode === 'release'
    }))
    .pipe(autoprefixer({ browsers: ['and_chr >= 50', 'ios_saf >= 9']}))
    .pipe(rename('app.css'))
    .pipe(gulp.dest(dest + '/css/compiled/'));
}

function buildScripts(src, dest) {
  return browserify(src + '/js/main.ts', { debug: true })
    .plugin(tsify)
    .transform(babelify, {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      presets: ['es2015']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(sourcemaps.write('../'))
    .pipe(gulp.dest(dest));
}

gulp.task('html', function() {
  var context = require('./' + options.env);
  context.TARGET = options.target;
  context.MODE = options.mode;

  return buildHtml('src', 'www', context);
});

gulp.task('styl', function() {
  return buildStyl('src/styl/index.styl', 'www', options.mode);
});

gulp.task('scripts', function() {
  return buildScripts('./src', 'www');
});

gulp.task('watch-scripts', function() {
  var opts = watchify.args;
  opts.debug = true;

  var bundleStream = watchify(
    browserify('./src/js/main.ts', opts)
    .plugin(tsify)
    .transform(babelify, {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      presets: ['es2015']
    })
  );

  function rebundle() {
    return bundleStream
      .bundle()
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
  gulp.watch(['src/index.html', 'env.json'], ['html']);
});

gulp.task('default', ['html', 'styl', 'scripts']);
gulp.task('watch', ['html', 'styl', 'watch-scripts', 'launch-watch']);
