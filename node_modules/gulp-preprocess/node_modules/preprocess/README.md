# preprocess  [![Build Status](https://travis-ci.org/jsoverson/preprocess.png?branch=master)](https://travis-ci.org/jsoverson/preprocess)

Preprocess HTML, JavaScript, and other files with directives based off custom or ENV configuration

## What does it look like?

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

```js 
var configValue = '/* @echo FOO */' || 'default value';

// @ifdef DEBUG 
someDebuggingCall()
// @endif

```

## Directive syntax

### Simple syntax

The most basic usage is for files that only have two states, non-processed and processed.
In this case, your `@exclude` directives are removed after preprocessing

```html
<body>
    <!-- @exclude -->
    <header>You're on dev!</header>
    <!-- @endexclude -->
</body>
```

After build

```html
<body>
</body>
```

### Advanced directives

 - `@if VAR='value'` / `@endif`
   This will include the enclosed block if your test passes
 - `@ifdef VAR` / `@endif`
   This will include the enclosed block if VAR is defined (typeof !== 'undefined')
 - `@ifndef VAR` / `@endif`
   This will include the enclosed block if VAR is not defined (typeof === 'undefined')
 - `@include`
   This will include the source from an external file. If the included source ends with a newline then the
   following line will be space indented to the level the @include was found.
 - `@exclude` / `@endexclude`
   This will remove the enclosed block upon processing
 - `@echo VAR`
   This will include the environment variable VAR into your source

### Extended html Syntax

This is useful for more fine grained control of your files over multiple
environment configurations. You have access to simple tests of any variable within the context (or ENV, if not supplied)

```html
<body>
    <!-- @if NODE_ENV!='production' -->
    <header>You're on dev!</header>
    <!-- @endif -->

    <!-- @if NODE_ENV='production' -->
    <script src="some/production/javascript.js"></script>
    <!-- @endif -->

    <script>
    var fingerprint = '<!-- @echo COMMIT_HASH -->' || 'DEFAULT';
    </script>
</body>
```

With a `NODE_ENV` set to `production` and `0xDEADBEEF` in
`COMMIT_HASH` this will be built to look like

```html
<body>
    <script src="some/production/javascript.js"></script>

    <script>
    var fingerprint = '0xDEADBEEF' || 'DEFAULT';
    </script>
</body>
```

With NODE_ENV not set or set to dev and nothing in COMMIT_HASH,
the built file will be

```html
<body>
    <header>You're on dev!</header>

    <script>
    var fingerprint = '' || 'DEFAULT';
    </script>
</body>
```

You can also have conditional blocks that are hidden by default by using the
fictional `!>` end tag instead of `-->` after your condition:

```html
<!-- @if true !>
<p>Process was run!</p>
<!-- @endif -->
```

### JavaScript, CSS, C, Java Syntax

Extended syntax below, but will work without specifying a test

```js
normalFunction();
//@exclude
superExpensiveDebugFunction()
//@endexclude

'/* @echo USERNAME */'

anotherFunction();
```

Built with a NODE_ENV of production :

```js
normalFunction();

'jsoverson'

anotherFunction();
```

CSS example

```css
body {
/* @if NODE_ENV=='development' */
  background-color: red;
/* @endif */

}
// @include util.css
```

(CSS preprocessing supports single line comment style directives)



### Shell, PHP

```bash
#!/bin/bash

# @include util.sh

```

## Configuration and Usage

Install via npm

```bash
$ npm install --save preprocess
```

Use the exposed `preprocess` method or the convenience file functions. The context, by default, is the
current ENV config the process (`process.env`)

```js

var pp = require('preprocess');

var text = 'Hi, I am <!-- @echo USERNAME -->';

pp.preprocess(text);
// -> Hi, I am jsoverson

pp.preprocess(text, {USERNAME : "Bob"});
// -> Hi, I am Bob

// Simple wrapper around fs.readFile and fs.writeFile
pp.preprocessFile(src, dest, context, callback);

// Simple wrapper around fs.readFileSync and fs.writeFileSync
pp.preprocessFileSync(src, dest, context);

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using jshint

## Release History
 - 2.0.0 Added ability to echo strings, added conditional comments, removed lodash, merged 17, 13, 15, 16
 - 1.2.0 Added processing for hash-style comments (via @marsch). Added more file aliases.
 - 1.1.0 Added deep inclusion, fixed sequential ifs
 - 1.0.1 Fixed multiple inline echo statements
 - 1.0.0 Pulled from grunt-preprocess to stand alone

## License

Copyright OneHealth Solutions, Inc

Written by Jarrod Overson

Licensed under the Apache 2.0 license.
