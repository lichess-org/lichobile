const path = require('path');
const minimist = require('minimist');
const gulp = require('gulp');
const chalk = require('chalk');
const log = require('fancy-log');
const preprocess = require('gulp-preprocess');

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

function logErrorAndExit(error) {
  log.error(chalk.red(error.message))
  process.exit(1)
}

function html() {
  const context = require('./' + options.env);
  context.TARGET = options.target;
  context.MODE = options.mode;

  console.log(context);
  return gulp.src(path.join(SRC, 'index.html'))
    .pipe(preprocess({context: context}))
    .on('error', logErrorAndExit)
    .pipe(gulp.dest(DEST));
}

function launchWatch() {
  gulp.watch(['src/index.html'], html);
}

exports.html = html
exports.watch = gulp.series(html, launchWatch)
