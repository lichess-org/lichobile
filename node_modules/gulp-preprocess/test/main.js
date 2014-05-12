var should = require('should');
var gutil = require('gulp-util');
var preprocess = require('../');
var fs = require('fs');

require('mocha');

function fixtureFile(fileName) {
	return new gutil.File({
		base: 'test/fixtures',
		cwd: 'test/',
		path: 'test/fixtures/' + fileName,
		contents: fs.readFileSync('test/fixtures/' + fileName)
	});
};

process.env['FAKEHOME'] = '/Users/jas';

describe('gulp-preprocess', function(){
	describe('preprocess()', function(){

		it('should preprocess html', function(done){
			var stream = preprocess({
				context: {
					firstOption: 'bar',
					secondOption: 'foo'
				}
			});

			var fakeFile = fixtureFile('test.html');

			stream.once('data', function(newFile){
				should.exist(newFile);
				should.exist(newFile.contents);
				String(newFile.contents).should.equal(fs.readFileSync('test/expected/test.html', 'utf8'));
				done();
			});
			stream.write(fakeFile);

		});

		it('should preprocess javascript', function(done){
			var stream = preprocess({
				context: {
					firstOption: 'bar',
					secondOption: 'foo'
				}
			});

			var fakeFile = fixtureFile('test.js');

			stream.once('data', function(newFile){
				should.exist(newFile);
				should.exist(newFile.contents);
				String(newFile.contents).should.equal(fs.readFileSync('test/expected/test.js', 'utf8'));
				done();
			});
			stream.write(fakeFile);

		});

		it('should preprocess coffeescript', function(done){
			var stream = preprocess({
				context: {
					firstOption: 'bar',
					secondOption: 'foo'
				}
			});

			var fakeFile = fixtureFile('test.coffee');

			stream.once('data', function(newFile){
				should.exist(newFile);
				should.exist(newFile.contents);
				String(newFile.contents).should.equal(fs.readFileSync('test/expected/test.coffee', 'utf8'));
				done();
			});
			stream.write(fakeFile);

		});

	});
});
