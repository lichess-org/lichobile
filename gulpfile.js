var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('src/app.js')
        .pipe(browserify({
          insertGlobals : false,
          debug : true
        }))
        .pipe(gulp.dest('www/'));
});
