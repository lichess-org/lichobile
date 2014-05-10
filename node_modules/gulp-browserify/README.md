[![Build Status](https://travis-ci.org/deepak1556/gulp-browserify.png)](https://travis-ci.org/deepak1556/gulp-browserify)
[![NPM version](https://badge.fury.io/js/gulp-browserify.png)](http://badge.fury.io/js/gulp-browserify)

#[gulp](https://github.com/gulpjs/gulp)-browserify

<table>
<tr> 
<td>Package</td><td>gulp-browserify</td>
</tr>
<tr>
<td>Description</td>
<td>Bundle modules with BrowserifyJS</td>
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

# Usage


## Install

```
npm install --save-dev gulp-browserify
```

## Example

```javascript
var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Basic usage
gulp.task('scripts', function() {
	// Single entry point to browserify
	gulp.src('src/js/app.js')
		.pipe(browserify({
		  insertGlobals : true,
		  debug : !gulp.env.production
		}))
		.pipe(gulp.dest('./build/js'))
});
```

Make sure to pipe *only entry points*. Browserify will take care of other dependencies for you.

### Options

#### transform

Type : `[String || function]`

Specifies a pipeline of functions (or module names) through which the browserified bundle will be run. Check out [the list of transforms on node-browserify](https://github.com/substack/node-browserify#list-of-source-transforms).

##### Languages that compile to JavaScript

If you want to bundle files with extensions other than `.js` or `.json`, omit contents from streamed files and set `extensions` option.

Let's say you want to browserify CoffeeScript, install `coffeeify` and:

```javascript
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

gulp.task('coffee', function() {
  gulp.src('src/coffee/app.coffee', { read: false })
    .pipe(browserify({
      transform: ['coffeeify'],
      extensions: ['.coffee']
    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('./build/js'))
});
```

If you forget `{ read: false }`, gulp-browserify will passes the contents stream of a incoming file to node-browserify. Then node-browserify names the stream as `fake_xxx.js` and process it. Some transforms such as `coffeeify` determines whether to transform files with extensions. That is why you need `{ read: false }` for AltJS.

#### debug

Type : `Boolean`

Enable source map support. `!gulp.env.production` would work well.

#### extensions

Type: `[String]`

Array of extensions that you want to skip in `require()` calls in addition to `.js` and `.json`. Don't forget `.`.

With `{ extensions: ['.coffee'] }`, you can do `require('app')`. Instead, you have to do `require('app.coffee')`.

#### ignore
Type: `[String]`

Array of paths which should be passed to the ignore function of
browserify.

#### resolve

Type: `Function`

Custom module name resolution function. From [node-browserify](https://github.com/substack/node-browserify#var-b--browserifyfiles-or-opts) documentation:
> You can give browserify a custom `opts.resolve()` function or by default it uses
[`browser-resolve`](https://npmjs.org/package/browser-resolve).

Obviously, this function must implement the same API as [browser-resolve](https://npmjs.org/package/browser-resolve).

#### Other Options

Any other options you provide will be passed through to browserify. This is useful for setting things like `standalone` or `ignoreGlobals`.

### Custom options

#### nobuiltins

Remove builtins modules defined in `lib/builtins.js` (browserify module).
`opts.builtins` must be not defined and `opts.nobuiltins` can be an Array of
Strings or simply a String.

```js
gulp.task('scripts', function() {
  gulp.src(['src/index.js'])
    .pipe(browserify({
      nobuiltins: 'events querystring'
    }))
    .pipe(gulp.dest('./build/js'))
});
```

### Browserify-Shim

Example configuration

```javascript
gulp.task('scripts', function() {
	//single entry point to browserify
	gulp.src(['src/index.js'])
		.pipe(browserify({
		  shim: {
		    angular: {
                path: '/vendor/angular/angular.js',
                exports: 'angular'
		    },
            'angular-route': {
                path: '/vendor/angular-route/angular-route.js',
                exports: 'ngRoute',
                depends: {
                    angular: 'angular'
                }
            }
		  }
		}))
		.pipe(concat('dest.js'))
		.pipe(gulp.dest('./build'))
});
```
More information about configuring browserify-shim can be found [here](https://github.com/thlorenz/browserify-shim/blob/97d416cb3bc2ef531fae05a8eed4c86700ba4dc8/README.md).

### Events

Other than standard Node.js stream events, gulp-browserify emits its own events.

#### prebundle

```javascript
.on('prebundle', function(bundler){})
```

Event triggered just before invoking `bundler.bundle()` and provides the bundler object to work with in the callback.

This is especially useful if you want to `require()`, `external()` or other methods of node-browserify.

```javascript
gulp.task('scripts', function() {
  gulp.src('src/js/app.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production
    }))
    .on('prebundle', function(bundle) {
      bundle.external('domready');
      bundle.external('react');
    })
    .pipe(gulp.dest('./build/js'))
});
```

#### postbundle

```javascript
.on('postbundle', function(src){})
```

Event triggered after the bundle process is over and provides the bundled data as an argument to the callback.



#License

Copyright (c) 2014 Robo (deepak1556) https://github.com/deepak1556

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
