# gulp-preprocess [![Build Status](https://travis-ci.org/jas/gulp-preprocess.png?branch=master)](https://travis-ci.org/jas/gulp-preprocess) [![NPM version](https://badge.fury.io/js/gulp-preprocess.png)](http://badge.fury.io/js/gulp-preprocess)

> [Gulp](gulpjs.com) plugin to preprocess HTML, JavaScript, and other files base on custom context or environment configuration


## Information

<table>
<tr>
<td>Package</td><td>gulp-preprocess</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.9.0</td>
</tr>
<tr>
<td>Gulp Version</td>
<td>3.x</td>
</tr>
</table>


## Usage

### Install

```
npm install gulp-preprocess --save
```


## Examples

#### Gulpfile

```js
var preprocess = require('gulp-preprocess');

gulp.task('html', function() {
  gulp.src('./app/*.html')
    .pipe(preprocess())
    .pipe(gulp.dest('./dist/'))
});

gulp.task('scripts', function() {
  gulp.src(['./app/*.js')
    .pipe(preprocess())
    .pipe(gulp.dest('./dist/'))
});
```

#### Example HTML File

```html
<head>
  <title>Your App

  <!-- @if NODE_ENV='production' -->
  <script src="some/production/lib/like/analytics.js"></script>
  <!-- @endif -->

</head>
<body>
  <!-- @ifdef DEBUG -->
  <h1>Debugging mode - <!-- @echo RELEASE_TAG --> </h1>
  <!-- @endif -->
  <p>
  <!-- @include welcome_message.txt -->
  </p>
</body>
```

#### Example JavaScript File

```js
var configValue = '/* @echo FOO */' || 'default value';

// @ifdef DEBUG
someDebuggingCall()
// @endif
```

CoffeeScript files are also supported.


#### More Examples

`grunt-preprocess` uses [preprocess](https://github.com/jsoverson/preprocess#directive-syntax). More examples can be found in its [README](https://github.com/jsoverson/preprocess#directive-syntax).


## API

### preprocess(options)

#### options.context
Type: `Object`
Default: `{}`

Context for directives used in your preprocessed files. The default context consists of the current user environment variables. Custom context is merged with `process.env`.


## LICENSE

The MIT License (MIT)

Copyright (c) 2014 Jason Sandmeyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
