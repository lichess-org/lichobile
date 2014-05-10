/* jshint node:true */
'use strict';

var map = require('map-stream');
var PluginError = require('gulp-util').PluginError;
var reporters = require('./reporters');

var jshintPlugin = function(opt){
  var lint = require('./lint')(opt);
  var fileIgnored = require('./file-ignored');

  return map(function (file, cb) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported'));

    fileIgnored(file, function (err, ignored) {
      if (err || ignored) return cb(err, file);
      lint(file, function (err, output) {
        if (err) return cb(err);

        file.jshint = output;
        cb(null, file);
      });
    });
  });
};

// expose the reporters
jshintPlugin.failReporter = reporters.fail;
jshintPlugin.loadReporter = reporters.load;
jshintPlugin.reporter = reporters.reporter;

module.exports = jshintPlugin;
