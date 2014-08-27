var should = require('should');
var gutil = require('gulp-util');
var stylus = require('../');
var fs = require('fs');


require('mocha');

describe('gulp-stylus', function(){
	it('should render stylus .styl to CSS .css', function(done){
		var stream = stylus();

		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/normal.styl',
			contents: fs.readFileSync('test/fixtures/normal.styl')
		});

		stream.once('data', function(newFile){
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(fs.readFileSync('test/expected/normal.css', 'utf8'));
			done();
		});
		stream.write(fakeFile);
		stream.end();

	});

	it ('should compress when called', function(done){
		var stream = stylus({compress: true});
		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/normal.styl',
			contents: fs.readFileSync('test/fixtures/normal.styl')
		});

		stream.on('data', function(newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(fs.readFileSync('test/expected/compressed.css', 'utf8'));
			done();
		});

		stream.write(fakeFile);
		stream.end();
	});

	it ('should import other .styl files', function(done){
		var stream = stylus({import: __dirname + '/fixtures/one.styl'});
		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/normal.styl',
			contents: fs.readFileSync('test/fixtures/normal.styl')
		});

		stream.on('data', function(newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(fs.readFileSync('test/expected/imported.css', 'utf8'));
			done();
		});

		stream.write(fakeFile);
		stream.end();
	});

	it ('should define variables in .styl files', function(done){
		var stream = stylus({define: {'white': '#fff'}});
		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/define.styl',
			contents: fs.readFileSync('test/fixtures/define.styl')
		});

		stream.on('data', function(newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(fs.readFileSync('test/expected/define.css', 'utf8'));
			done();
		});

		stream.write(fakeFile);
		stream.end();
	});

	it('should skip css files', function(done){
		var stream = stylus();

		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/ie8.css',
			contents: fs.readFileSync('test/fixtures/ie8.css')
		});

		stream.once('data', function(newFile){
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(fs.readFileSync('test/fixtures/ie8.css', 'utf8'));
			done();
		});
		stream.write(fakeFile);
		stream.end();

	});


	it('should throw on parse error', function(done){
		var stream = stylus();

		var file = 'test/fixtures/error.styl';

		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: file,
			contents: fs.readFileSync(file)
		});

		stream.on('error', function(err) {
			should.exist(err);
			err.name.toString().should.match(/ParseError/);
			done();
		});
    stream.write(fakeFile);
    stream.end();

  });

	it ('should import nested and reverse recursive files', function(done){
		var stream = stylus();
		var fakeFile = new gutil.File({
			base: 'test/fixtures',
			cwd: 'test/',
			path: 'test/fixtures/import.styl',
			contents: fs.readFileSync('test/fixtures/import.styl')
		});

		stream.on('data', function(newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(fs.readFileSync('test/expected/import.css', 'utf8'));
			done();
		});
		stream.write(fakeFile);
		stream.end();
	});

});
