var Q = require('q');
var gulp = require('gulp');
var buildFile = require('../gulpfile');
var path = require('path');

var srcFolder = path.join(__dirname, '../src'), // sources folder
  assetsDest = path.join(__dirname, '../www'); // public assets destinations

module.exports.build = function build(platform, settings, configName) {
  var defer = Q.defer();

  configName = configName || 'default';
  var mode = ['prod', 'stage', 'beta'].indexOf(configName) !== -1 ? configName : 'dev';
  var context = settings.configurations[platform][configName];
  context.MODE = mode;
  context.TARIFA = true;
  context.APP_VERSION = context.version || settings.version;
  if (context.beta) context.APP_VERSION += '-beta' + context.beta;

  gulp.add('html', function() {
    return buildFile.buildHtml(srcFolder, assetsDest, context);
  });

  gulp.add('styl', function() {
    return buildFile.buildStyl(srcFolder + '/styl/index.styl', assetsDest, mode);
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

module.exports.watch = function() { };
module.exports.close = function() { };
