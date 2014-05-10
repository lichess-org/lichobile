var RcLoader = require('rcloader');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');

module.exports = function createLintFunction(userOpts) {

  var rcLoader = new RcLoader('.jshintrc', userOpts, {
    loader: function (path) {
      var cfg = jshintcli.loadConfig(path);
      delete cfg.dirname;
      return cfg;
    }
  });

  var formatOutput = function (success, file, cfg) {
    // no error
    if (success) return {success: success};

    var filePath = (file.path || 'stdin');

    // errors
    var results = jshint.errors.map(function (err) {
      if (!err) return;
      return {file: filePath, error: err};
    }).filter(Boolean);

    var data = [jshint.data()];
    data[0].file = filePath;

    return {
      success: success,
      results: results,
      data: data,
      opt: cfg
    };
  };

  return function lint(file, cb) {
    rcLoader.for(file.path, function (err, cfg) {
      if (err) return cb(err);

      var globals;
      if (cfg.globals) {
        globals = cfg.globals;
        delete cfg.globals;
      }

      var str = file.contents.toString('utf8');
      var success = jshint(str, cfg, globals);

      cb(null, formatOutput(success, file, cfg));
    });
  };
};