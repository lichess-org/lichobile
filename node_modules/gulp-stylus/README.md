#gulp-stylus
[![Build Status](https://travis-ci.org/stevelacy/gulp-stylus.png?branch=master)](https://travis-ci.org/stevelacy/gulp-stylus)
[![NPM version](https://badge.fury.io/js/gulp-stylus.png)](http://badge.fury.io/js/gulp-stylus)

> Compile [Stylus](http://learnboost.github.io/stylus/) with gulp (gulpjs.com)

## Information

<table>
<tr>
<td>Package</td><td>gulp-stylus</td>
</tr>
<tr>
<td>Description</td>
<td>Stylus plugin for gulp</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.9</td>
</tr>
<tr>
<td>Gulp Version</td>
<td>3.x</td>
</tr>
</table>

## Usage

#### Install

```sh
$ npm install --save-dev gulp-stylus
```

## Examples

```javascript

// Gulpfile.js
// Require the needed packages
var gulp = require('gulp');
var stylus = require('gulp-stylus');


// Get one .styl file and render
gulp.task('one', function () {
  gulp.src('./css/one.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./css'));
});

// Get and render all .styl files recursively
gulp.task('stylus', function () {
  gulp.src('./css/**/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./css'));
});


// Use nib
// Require nib
var nib = require('nib');
// either a String or an Array
gulp.task('nib', function () {
  gulp.src('./css/nib.styl')
    .pipe(stylus({use: [nib()]}))
    .pipe(gulp.dest('./css/nib'));
});

// Default gulp task to run
gulp.task('default', ['stylus', 'one']);

```

#####You can view more examples in the [example folder.](https://github.com/stevelacy/gulp-stylus/tree/master/examples)

## Options
#### All stylus options are passed to [accord/stylus](https://github.com/jenius/accord/blob/master/docs/stylus.md)





## LICENSE

(MIT License)

Copyright (c) 2014 Steve Lacy <me@slacy.me> - Fractal <contact@wearefractal.com> wearefractal.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
