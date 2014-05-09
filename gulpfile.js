var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// browserify
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('src/app.js')
        .pipe(browserify({
          insertGlobals : false,
          debug : true
        }))
        .pipe(gulp.dest('www/'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('src/*.js', ['lint', 'scripts']);
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'watch']);
