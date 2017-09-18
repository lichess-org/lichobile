const path = require('path');
const source = require('vinyl-source-stream');
const minimist = require('minimist');
const gulp = require('gulp');
const gutil = require('gulp-util');
const preprocess = require('gulp-preprocess');
const watchify = require('watchify');
const browserify = require('browserify');
const babelify = require('babelify');
const tsify = require('tsify');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer')

const SRC = 'src'
const DEST = 'www'

// command line options
const minimistOptions = {
  string: ['env', 'mode', 'target'],
  default: {
    env: 'env.json',
    mode: 'dev',
    target: 'browser'
  }
};
const options = minimist(process.argv.slice(2), minimistOptions);

const paths = {
  styles: ['src/styl/reset.styl', 'src/styl/common.styl', 'src/styl/form.styl',
    'src/styl/overlay.styl', 'src/styl/overlay-popup.styl', 'src/styl/*.styl',
    'src/**/*.styl'
  ]
};

gulp.task('html', () => {
  const context = require('./' + options.env);
  context.TARGET = options.target;
  context.MODE = options.mode;

  console.log(context);
  return gulp.src(path.join(SRC, 'index.html'))
    .pipe(preprocess({context: context}))
    .pipe(gulp.dest(DEST));
});

gulp.task('styl', () => {
  return gulp.src(SRC + '/styl/index.styl')
  .pipe(stylus({
    compress: options.mode === 'release'
  }))
  .pipe(autoprefixer({ browsers: ['and_chr >= 50', 'ios_saf >= 9']}))
  .pipe(rename('app.css'))
  .pipe(gulp.dest(DEST + '/css/compiled/'));
});

gulp.task('scripts', () => {
  return browserify(SRC + '/main.ts', { debug: true })
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
    .on('error', error => gutil.log(gutil.colors.red(error.message)))
    .pipe(sourcemaps.write('../'))
    .pipe(gulp.dest(DEST));

});

gulp.task('watch-scripts', () => {
  const opts = watchify.args;
  opts.debug = true;

  const bundleStream = watchify(
    browserify(SRC + '/main.ts', opts)
    .plugin(tsify)
    .transform(babelify, {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      presets: ['es2015']
    })
  );

  function rebundle() {
    return bundleStream
      .bundle()
      .on('error', error => gutil.log(gutil.colors.red(error.message)))
      .pipe(source('app.js'))
      .pipe(gulp.dest('./www'));
  }

  bundleStream.on('update', rebundle);
  bundleStream.on('log', gutil.log);

  return rebundle();
});

// Watch Files For Changes
gulp.task('launch-watch', () => {
  gulp.watch(paths.styles, ['styl']);
  gulp.watch(['src/index.html', 'env.json'], ['html']);
});

gulp.task('default', ['html', 'styl', 'scripts']);
gulp.task('watch', ['html', 'styl', 'watch-scripts', 'launch-watch']);
