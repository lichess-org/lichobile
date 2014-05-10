var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var coffeeify = require('coffeeify');
var expect = require('chai').expect;
var vm = require('vm')
var through = require('through2');

var gulpB = require('../');
var prepare = require('./prepare');

function createFakeFile(filename, contents) {
  return new gutil.File({
    cwd: process.cwd(),
    base: path.join(__dirname, 'fixtures'),
    path: path.join(__dirname, 'fixtures', filename),
    contents: contents
  });
}

describe('gulp-browserify', function() {
  before(function (done) {
    prepare(['normal.js', 'normal2.js', 'exclude.js'], done);
  });

  it('should return files', function(done) {
    var fakeFile = createFakeFile('normal.js', new Buffer("var test = 'test';"));
    gulpB().once('data', function(bundled){
      expect(bundled.contents).to.exist;
      done();
    }).end(fakeFile);
  });

  it('should return a buffer', function(done) {
    var fakeFile = createFakeFile('normal.js', new Buffer("var test = 'test';"));
    gulpB().once('data', function(bundled){
      expect(bundled.contents).to.be.an.instanceof(Buffer);
      done();
    }).end(fakeFile);
  });

  it('should return a vinyl file object', function(done) {
    var fakeFile = createFakeFile('normal.js', new Buffer("var test = 'test';"));
    gulpB().once('data', function(bundled){
      expect(bundled.cwd).to.be.a('string');
      expect(bundled.base).to.be.a('string');
      expect(bundled.path).to.be.a('string');
      done();
    }).end(fakeFile);
  });

  it('should return a browserify require file', function(done) {
    var fakeFile = createFakeFile('normal.js', fs.readFileSync('test/fixtures/normal.js'));
    gulpB().once('data', function(bundled) {
      expect(bundled.contents.toString()).to.equal(fs.readFileSync('test/expected/normal.js', 'utf8'));
      done();
    }).end(fakeFile);
	});

  describe ('it should handle the external option', function() {
    it ('when specified as a string', function(done) {
      var fakeFile = createFakeFile('external.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = { extensions: ['.foo', '.bar'], external: './ext_bar'};
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.not.match(/bar: 'Bar!'/);
        done();
      }).end(fakeFile);
    });

    it ('when specified as an array', function(done) {
      var fakeFile = createFakeFile('external.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = { extensions: ['.foo', '.bar'], external: ['./ext_bar', './ext_foo']};
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.not.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.not.match(/bar: 'Bar!'/);
        done();
      }).end(fakeFile);
    });
  });

  describe ('it should handle the exclude option', function() {
    it ('by throwing an error on invalid requires', function(done) {
      var fakeFile = createFakeFile('exclude.js', fs.readFileSync('test/fixtures/exclude.js'))
      var opts = { exclude: ['./increment']};

      gulpB(opts).once('data', function(bundled){
        var sandbox = {value: 20};

        expect(function() {
          vm.runInNewContext(bundled.contents.toString('utf8'), sandbox);
        }).to.throw("Cannot find module './increment'");

        expect(sandbox.value).to.equal(20)
        done();
      }).end(fakeFile);
    });
  });

  describe ('it should handle the add option', function() {
    it ('by adding contents of given file to bundle', function(done) {
      var fakeFile = createFakeFile('add.js', fs.readFileSync('test/fixtures/add.js'));
      var opts = { add: ['./add_file'] };

      gulpB(opts).once('data', function(bundled){
        var sandbox = {addValue: 0};

        vm.runInNewContext(bundled.contents.toString('utf8'), sandbox);

        expect(sandbox.addValue).to.equal(100);
        done();
      }).end(fakeFile);
    });
  });

  describe ('it should handle the ignore option', function() {
    it ('when specified as a string', function(done) {
      var fakeFile = createFakeFile('ignore.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = { extensions: ['.foo', '.bar'], ignore: './ext_bar'};
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.not.match(/bar: 'Bar!'/);
        done();
      }).end(fakeFile);
    });
    it ('when specified as a list', function(done) {
      var fakeFile = createFakeFile('ignore.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = { extensions: ['.foo', '.bar'], ignore: ['./ext_foo','./ext_bar']};
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.not.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.not.match(/bar: 'Bar!'/);
        done();
      }).end(fakeFile);
    });
  });

  describe ('it should handle the require option', function() {
    it ('when specified as a string', function(done) {
      var fakeFile = createFakeFile('ignore.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = { extensions: ['.foo', '.bar'], require: './ext_bar' };
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.match(/bar: 'Bar!'/);
        expect(bundled.contents.toString()).to.match(/^require=/);
        expect(bundled.contents.toString()).to.match(/".\/ext_bar"\:/);
        done();
      }).end(fakeFile);
    });
    it ('when specified as a list', function(done) {
      var fakeFile = createFakeFile('ignore.js', fs.readFileSync('test/fixtures/extension.js'));
      var opts = {
        extensions: ['.foo', '.bar'],
        require: [['./ext_foo', { expose: 'foo' }], ['./ext_bar', { expose: 'bar' }]]
      };
      gulpB(opts).once('data', function(bundled){
        expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
        expect(bundled.contents.toString()).to.match(/bar: 'Bar!'/);
        expect(bundled.contents.toString()).to.match(/^require=/);
        expect(bundled.contents.toString()).to.match(/"foo"\:/);
        expect(bundled.contents.toString()).to.match(/"bar"\:/);
        done();
      }).end(fakeFile);
    });
  });

  it('should return a browserify require file without entry point contents', function(done) {
    var fakeFile = createFakeFile('normal.js', null);
    gulpB().once('data', function(bundled) {
      expect(bundled.contents.toString()).to.equal(fs.readFileSync('test/expected/normal.js', 'utf8'));
      done();
    }).end(fakeFile);
  });

  it('should bundles multiple entry points', function(done) {
    var fakeFile1 = createFakeFile('normal.js', fs.readFileSync('test/fixtures/normal.js'));
    var fakeFile2 = createFakeFile('normal2.js', fs.readFileSync('test/fixtures/normal2.js'));
    var files = {};
    var B = gulpB().on('data', function(bundled) {
      // Order is not guaranteed. Let's keep it with file name.
      files[path.basename(bundled.path)] = bundled;
    }).on('end', function() {
      expect(Object.keys(files).length).to.equal(2);
      expect(files['normal.js'].contents.toString()).to.equal(fs.readFileSync('test/expected/normal.js', 'utf8'));
      expect(files['normal2.js'].contents.toString()).to.equal(fs.readFileSync('test/expected/normal2.js', 'utf8'));
      done();
    });
    B.write(fakeFile1);
    B.end(fakeFile2);
  });

	it('should use the file modified through gulp', function(done) {
    var fakeFile = createFakeFile('normal.js', new Buffer("var test = 'test';"));
    gulpB().once('data', function(bundled){
      expect(bundled.contents.toString()).to.not.equal("var test = 'test';");
      done();
    }).end(fakeFile);
  });

  it('should shim files', function(done) {
    var fakeFile = createFakeFile('shim.js', fs.readFileSync('test/fixtures/shim.js'));
    var opts = {
      shim: {
        bar: {
          path: 'test/fixtures/bar.js',
          exports: 'bar'
        }
      }
    };
    gulpB(opts).once('data', function(bundled){
      expect(bundled.contents.toString()).to.match(/window.bar = \'foobar\'/);
      done();
    }).end(fakeFile);
  });

  it('should emit postbundle event', function(done) {
    var fakeFile = createFakeFile('normal.js', fs.readFileSync('test/fixtures/normal.js'));
    gulpB().once('data', function(bundled) {
      expect(bundled.contents).to.exist;
      done();
    }).on('postbundle', function(data) {
      expect(data.toString()).to.equal(fs.readFileSync('test/expected/normal.js', 'utf8'));
    }).end(fakeFile);
  });

  it('should use extensions', function(done) {
    var fakeFile = createFakeFile('extension.js', fs.readFileSync('test/fixtures/extension.js'));
    var opts = { extensions: ['.foo', '.bar'] };
    gulpB(opts).once('data', function(bundled){
      expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
      expect(bundled.contents.toString()).to.match(/bar: 'Bar!'/);
      done();
    }).end(fakeFile);
  });

  it('should not parse with noParse', function(done) {
    var fakeFile = createFakeFile('normal.js', fs.readFileSync('test/fixtures/normal.js'));
    var files = [];
    gulpB({noParse: 'chai'}).on('data', function(bundled){
      files.push(bundled);
      expect(bundled.contents).to.exist;
    }).once('end', function(){
      expect(files.length).to.equal(1);
      expect(files[0].contents.length).to.equal(581);
      done();
    }).end(fakeFile);
  });

  it('should use custom resolve function', function(done) {
    // Use new Buffer instead of normal.js contents because normal.js
    // requires "chai", and if this test fails (resolve function not used)
    // all the chai will be printed to stdout (when .to.match() fails),
    // that's annoying, trust me. And new fixture file for this is overkill.
    var fakeFile = createFakeFile('fake.js', new Buffer('require("fake");'));
    var opts = {
      resolve: function(pkg, opts, cb) {
        cb(null, path.resolve('./test/fixtures/custom_resolved.js'));
      }
    };
    gulpB(opts).once('data', function(bundled) {
      expect(bundled.contents.toString()).to.match(/resolved content/);
      done();
    }).end(fakeFile);
  });

  it('should allow external with buffer', function(done) {
    var fakeFile = createFakeFile('normal.js', fs.readFileSync('test/fixtures/normal.js'));
    var files = [];
    gulpB().on('prebundle', function(bundler) {
      bundler.external('chai');
    }).on('data', function(bundled){
      files.push(bundled);
      expect(bundled.contents).to.exist;
    }).once('end', function(){
      expect(files.length).to.equal(1);
      expect(files[0].contents.length).to.equal(504);
      done();
    }).end(fakeFile);
  });

  it('should transform files without entry contents', function(done) {
    // Don't set file contents. Browserify names stream entry as `fake_xxx.js`
    // but coffeify does not work with `.js` files.
    // Without contents, gulp-browserify passes file path to browserify
    // and browserify can reads file from th e given path.
    var fakeFile = createFakeFile('transform.coffee', null);
    var opts = { transform: ['coffeeify'], extensions: ['.coffee'] };
    gulpB(opts).once('data', function (bundled) {
      expect(bundled.contents.toString()).to.match(/foo: 'Foo!'/);
      expect(bundled.contents.toString()).to.match(/bar: 'Bar!'/);
      done();
    }).end(fakeFile);
  });

  it('should emit an error when bundle throws a standard error', function(done) {
    var fakeFile = createFakeFile('not_found.js', new Buffer('require("--non-existent");'));
    gulpB().once('error', function (err) {
      expect(err).to.exist;
      expect(err).to.be.instanceof(gutil.PluginError);
      expect(err.message).to.include('module "--non-existent" not found');
      expect(err.stack).to.exist;
      expect(err.plugin).to.eq('gulp-browserify');
      expect(err.name).to.eq('Error');
      done();
    }).end(fakeFile);
  });

  it('should emit an error with file name and line number when bundle throws a syntax error', function(done) {
    var fakeFile = createFakeFile('trans_error.coffee', null);
    var opts = { transform: ['coffeeify'], extensions: ['.coffee'] };
    gulpB(opts).once('error', function (err) {
      expect(err).to.exist;
      expect(err).to.be.instanceof(gutil.PluginError);
      expect(err.message).to.include('test/fixtures/trans_error.coffee:2');
      expect(err.message).to.include('ParseError: unexpected ');
      expect(err.stack).to.exist;
      expect(err.plugin).to.eq('gulp-browserify');
      expect(err.name).to.eq('SyntaxError');
      done();
    }).end(fakeFile);
  });

  it('should emit an error when bundle throws a plain string as an error', function(done) {
    var fakeFile = createFakeFile('some.js', new Buffer('console.log("something");'));
    function stringErrorTransform(file) {
      return through(function (chunk, encoding, callback) {
        callback('string error!');
      });
    }
    var opts = { transform: [stringErrorTransform], extensions: ['.coffee'] };
    gulpB(opts).once('error', function (err) {
      expect(err).to.exist;
      expect(err).to.be.instanceof(gutil.PluginError);
      expect(err.message).to.eq('string error!');
      expect(err.plugin).to.eq('gulp-browserify');
      expect(err.stack).to.exist;
      expect(err.name).to.eq('Error');
      done();
    }).end(fakeFile);
  });
});
