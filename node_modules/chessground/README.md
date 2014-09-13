# ChessGround

Multipurpose chess UI.

ChessGround is written in [clojurescript](https://github.com/clojure/clojurescript)
with [om](https://github.com/swannodette/om)
as an interface to [React](http://facebook.github.io/react/).

It uses [interact.js](https://github.com/taye/interact.js) as single javascript
dependency.

This library is meant to replace all [lichess.org](http://lichess.org) chessboards,
and can be used as a drop-in replacement for chessboardjs and pgn4web.

It targets all modern browsers, as well as mobile development using Cordova.

Even thought all code is written in clojurescript, it exposes a JavaScript public API.

## Usage

Chessground can be required in a browserify environment, or loaded with a script
tag.

Attach a board to a DOM element with defaults options:

```javascript
var ground = chessground.main(document.getElementById('ground'));
```

## Build

### Prerequisites

You will need the Java SDK,
[Leiningen](https://github.com/technomancy/leiningen) and
[npm](https://github.com/npm/npm) to build chessground.

### Development

```sh
lein cljsbuild auto dev
```

To serve the examples from a webserver (avoid cross domain requests):

```
sudo npm install -g http-server
http-server
```

Then open [http://localhost:8080/examples/index.html](http://localhost:8080/examples/index.html).

### Production

To make a production build:

```sh
npm install
npm run build
```

This will generate a chessground.js file in the project root.

Then try it on [http://localhost:8080/examples/index.html?prod](http://localhost:8080/examples/index.html?prod).
