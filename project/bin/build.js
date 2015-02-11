var Q = require('q');
var gulp = require('gulp');
var buildFile = require('../gulpfile');
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');
var chokidar = require('chokidar');
var gulp = require('gulp');
var buildFile = require('../gulpfile');
var path = require('path');

var w, // watchify instance
  assetsWatcher, // chokidar assetsWatcher instance
  stylWatcher,
  srcFolder = path.join(__dirname, '../src'), // sources folder
  assetsDest = path.join(__dirname, '../www'), // public assets destinations
  stylesPaths = [srcFolder + '/styl/reset.styl', srcFolder + '/styl/common.styl', srcFolder + '/styl/*.styl'],
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
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true
    });

  if (fs.existsSync(bundledJS)) fs.unlinkSync(bundledJS);

  var ws = fs.createWriteStream(bundledJS);

  b.add(srcFolder + '/js/main.js')
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

  configName = configName || 'default';
  var mode = ['prod'].indexOf(configName) !== -1 ? 'prod' : 'dev';
  var context = settings.configurations[platform][configName];
  context.TARIFA = true;
  context.APP_VERSION = context.version || settings.version;
  if (context.beta) context.APP_VERSION += '-beta' + context.beta;

  gulp.add('html', function() {
    return buildFile.buildHtml(srcFolder, assetsDest, context);
  });

  gulp.add('styl', function() {
    return buildFile.buildStyl(stylesPaths, assetsDest, mode);
  });

  gulp.add('scripts', function() {
    return buildFile.buildScripts(srcFolder, assetsDest, mode);
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
        buildFile.buildStyl(stylesPaths, assetsDest, mode);
      });
    }, 4000);
  });
};

module.exports.close = function() {
  if (w) w.close();
  if (assetsWatcher) assetsWatcher.close();
  if (stylWatcher) stylWatcher.close();
};
