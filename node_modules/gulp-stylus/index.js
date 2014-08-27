var through = require('through2');
var stylus = require('accord').load('stylus');
var gutil = require("gulp-util");
var rext = require('replace-ext');
var path = require('path');

module.exports = function (options) {
  var opts = options ? options : {};
  opts.paths = opts.paths ? opts.paths : [];

  return through.obj(function (file, enc, cb) {

    if (file.isStream()) return cb(new gutil.PluginError("gulp-stylus: Streaming not supported"));
    if (file.isNull()){
      return cb(null, file);
    }
    if (path.extname(file.path) === '.css'){
      return cb(null, file);
    }
    opts.filename = file.path;
    opts.paths.push(path.dirname(file.path));

    stylus.render(file.contents.toString('utf8'), opts)
    .catch(function(err){
      return cb(new gutil.PluginError('gulp-stylus', err));
    })
    .then(function(css){
      if (css !== undefined){
        file.path = rext(file.path, '.css');
        file.contents = new Buffer(css);
        return cb(null, file);
      }
    });
  });

};
