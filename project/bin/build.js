var Q = require('q');
var gulp = require('gulp');
var buildFile = require('../gulpfile');
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');
var chokidar = require('chokidar');
var gulp = require('gulp');
var buildFile = require('../gulpfile');

var w, // watchify instance
  assetsWatcher, // chokidar assetsWatcher instance
  stylWatcher,
  srcFolder = '../src', // sources folder
  assetsDest = '../www', // public assets destinations
  bundledJS = assetsDest + '/app.js';

function log(o) {
  if (o) console.log('- browserify - ' + o);
}

function rejectOnError(d) {
  return function(err) {
    log(err);
    if (err) d.reject(err);
  };
}

function bundle() {
  var defer = Q.defer(),
    b = browserify({
      cache: {},
      packageCache: {},
      fullPaths: true
    });

  if (fs.existsSync(bundledJS)) fs.unlinkSync(bundledJS);

  var ws = fs.createWriteStream(bundledJS);

  b.add(srcFolder + '/javascripts/app.js')
    .bundle(rejectOnError(defer))
    .pipe(ws);

  ws.on('finish', function() {
    ws.end();
    defer.resolve(b);
  });

  return defer.promise;
}

function launchWatchify(f) {
  return bundle().then(function(b) {
    var w = watchify(b);

    b.bundle(function() {
      w.on('log', log);
    });

    w.on('update', function() {
      var ws = fs.createWriteStream(bundledJS);

      w.bundle(log).pipe(ws);

      ws.on('finish', function() {
        ws.end();
        f(bundledJS);
      });
    });
    return w;
  });
}

module.exports.build = function build(platform, settings, configName) {
  var defer = Q.defer();

  var paths = {
    styles: ['../src/styl/reset.styl', '../src/styl/common.styl', '../src/styl/*.styl'],
  };

  configName = configName || 'default';
  var mode = configName === 'prod' ? 'prod' : 'dev';
  var context = settings.configurations[platform][configName];
  console.log(platform, settings, configName);
  console.log(context);

  gulp.add('html', function() {
    return buildFile.buildHtml(srcFolder, assetsDest, context);
  });

  gulp.add('styl', function() {
    return buildFile.buildStyl(paths.styles, assetsDest, mode);
  });

  gulp.add('scripts', function() {
    return buildFile.buildScripts('./project/src', assetsDest, mode);
  });

  gulp.start('html', 'styl', 'scripts', function(err) {
    if (err) defer.reject(err);
    else defer.resolve();
  });

  return defer.promise;
};

module.exports.watch = function watch(f, settings, platform, config) {
  var mode = config === 'prod' ? 'prod' : 'dev';

  launchWatchify(f).then(function(bw) {
    w = bw;
    assetsWatcher = chokidar.watch(assetsDest, {
      ignored: /app\.js/,
      persistent: true
    });
    stylWatcher = chokidar.watch(srcFolder + '/styl', {
      persistent: true
    });

    setTimeout(function() {
      assetsWatcher.on('all', function(evt, p) {
        f(p);
      });
      stylWatcher.on('change', function(p) {
        console.log('styl file ' + p + ' updated');
        buildFile.buildStyl(srcFolder, assetsDest, mode);
      });
    }, 4000);
  });
};

module.exports.close = function() {
  if (w) w.close();
  if (assetsWatcher) assetsWatcher.close();
  if (stylWatcher) stylWatcher.close();
};
