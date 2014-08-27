// include the required packages.
var gulp = require('gulp');
var nib = require('nib');
var stylus = require('../');


// Get one .styl file and render
gulp.task('one', function () {
	gulp.src('./css/one.styl')
		.pipe(stylus())
		.pipe(gulp.dest('./css/build'));
});

// Options
// Options compress
gulp.task('compress', function () {
	gulp.src('./css/*.styl')
		.pipe(stylus({compress: true}))
		.pipe(gulp.dest('./css/build'));
});

// Use nib
gulp.task('nib', function () {
  gulp.src('./css/nib.styl')
    .pipe(stylus({use: [nib()]}))
    .pipe(gulp.dest('./css/build'));
});

// Set linenos
gulp.task('linenos', function () {
  gulp.src('./css/linenos.styl')
    .pipe(stylus({linenos: true}))
    .pipe(gulp.dest('./css/build'));
});


// Default gulp task to run
gulp.task('default', ['nib', 'one', 'linenos']);
