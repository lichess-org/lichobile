var jshint = require('../');
var should = require('should');
var gutil = require('gulp-util');
var path = require('path');
require('mocha');

describe('gulp-jshint', function() {
  describe('jshint.reporter(fail)', function(){
    it('should emit error on failure', function(done) {
      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('doe =')
      });

      var stream = jshint();
      var failStream = jshint.reporter('fail');
      stream.pipe(failStream);

      failStream.on('error', function (err) {
        should.exist(err);
        err.message.indexOf(fakeFile.relative).should.not.equal(-1, 'should say which file');
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });
  });

  describe('jshint.reporter()', function() {
    it('file should pass through', function(done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var stream = jshint.reporter();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        ++a;
      });

      stream.once('end', function () {
        a.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('file should trigger reporter when .jshint exists', function(done) {
      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      fakeFile.jshint = {
        success: false,
        results: 200, // not real data
        data: 300, // not real data
        opt: 400 // not real data
      };

      var stream = jshint.reporter(function(results, data, opt){
        should.exist(results);
        should.exist(data);
        should.exist(opt);
        results.should.equal(200);
        data.should.equal(300);
        opt.should.equal(400);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });
  });
});
