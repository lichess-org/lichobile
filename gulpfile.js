const path = require('path');
const { exec } = require('child_process');
const source = require('vinyl-source-stream');
const minimist = require('minimist');
const gulp = require('gulp');
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const terser = require('rollup-plugin-terser')
const chalk = require('chalk');
const log = require('fancy-log');
const preprocess = require('gulp-preprocess');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const buffer = require('vinyl-buffer')

const SRC = 'src'
const DEST = 'www'

// command line options
const minimistOptions = {
  string: ['env', 'mode', 'target'],
  default: {
    env: 'env.json',
    mode: 'dev',
    target: 'web'
  }
};
const options = minimist(process.argv.slice(2), minimistOptions);

const paths = {
  styles: ['src/styl/reset.styl', 'src/styl/common.styl', 'src/styl/form.styl',
    'src/styl/overlay.styl', 'src/styl/overlay-popup.styl', 'src/styl/*.styl',
    'src/**/*.styl'
  ]
};

function logErrorAndExit(error) {
  log.error(chalk.red(error.message))
  process.exit(1)
}

gulp.task('html', () => {
  const context = require('./' + options.env);
  context.TARGET = options.target;
  context.MODE = options.mode;

  console.log(context);
  return gulp.src(path.join(SRC, 'index.html'))
    .pipe(preprocess({context: context}))
    .on('error', logErrorAndExit)
    .pipe(gulp.dest(DEST));
});

gulp.task('styl', () => {
  return gulp.src(SRC + '/styl/index.styl')
  .pipe(stylus({
    compress: options.mode === 'release'
  }))
  .pipe(autoprefixer())
  .pipe(rename('app.css'))
  .on('error', logErrorAndExit)
  .pipe(gulp.dest(DEST + '/css/compiled/'));
});

gulp.task('compile', cb => {
  exec('npx tsc --outDir build/', (err, stdout, stderr) => {
    log.error(chalk.red(stdout))
    cb(err)
  })
})

gulp.task('bundle', (cb) => {
  // return rollup.rollup({
  //   input: 'build/main.js',
  //   plugins: [
  //     resolve(),
  //     commonjs(),
  //     json(),
  //     options.mode === 'release' && terser(),
  //   ],
  //   onwarn(warning, warn) {
  //     if (warning.code === 'CIRCULAR_DEPENDENCY') return
  //     if ( warning.code === 'THIS_IS_UNDEFINED' ) return
  //     warn(warning)
  //   }
  // }).then(bundle => {
  //   return bundle.write({
  //     file: 'www/app.js',
  //     format: 'iife',
  //     sourcemap: true
  //   });
  // });
  exec('npx rollup -c', (err, stdout, stderr) => {
    log.info(stderr)
    cb(err)
  })
});

gulp.task('watch-scripts', () => {
});

// Watch Files For Changes
gulp.task('launch-watch', () => {
  gulp.watch(paths.styles, gulp.parallel(['styl']));
  gulp.watch(['src/index.html', 'env.json'], gulp.parallel(['html']));
});

gulp.task('default', gulp.parallel(['html', 'styl', 'bundle']));
gulp.task('watch', gulp.series(['html', 'styl', 'watch-scripts', 'launch-watch']));
