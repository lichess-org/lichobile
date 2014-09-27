var map = require('map-stream');
var PluginError = require('gulp-util').PluginError;

exports.failReporter = function(){
  return map(function (file, cb) {
    // nothing to report or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);
    var errOpt = {
      message: 'JSHint failed for: '+file.relative,
      showStack: false
    };
    var err = new PluginError('gulp-jshint', errOpt);
    return cb(err, file);
  });
};

exports.loadReporter = function(reporter) {
  // we want the function
  if (typeof reporter === 'function') return reporter;

  // object reporters
  if (typeof reporter === 'object' && typeof reporter.reporter === 'function') return reporter.reporter;

  // load jshint built-in reporters
  if (typeof reporter === 'string') {
    try {
      return exports.loadReporter(require('jshint/src/reporters/'+reporter));
    } catch (err) {}
  }

  // load full-path or module reporters
  if (typeof reporter === 'string') {
    try {
      return exports.loadReporter(require(reporter));
    } catch (err) {}
  }
};

exports.reporter = function (reporter) {
  if (!reporter) reporter = 'default';
  if (reporter === 'fail') {
    return exports.failReporter();
  }
  var rpt = exports.loadReporter(reporter);

  if (typeof rpt !== 'function') {
    throw new PluginError('gulp-jshint', 'Invalid reporter');
  }

  // return stream that reports stuff
  return map(function (file, cb) {
    // nothing to report or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);

    rpt(file.jshint.results, file.jshint.data, file.jshint.opt);
    return cb(null, file);
  });
};
