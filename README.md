lichess mobile
==============

![lichess mobile screenshots](https://raw.githubusercontent.com/veloce/lichobile/1.6.x/screens/3-screens.png)

### Official lichess.org mobile application for Android & iOS.

- Challenge thousands of online players
- Play online or offline artificial intelligence
- Many chess variants available
- Play over the board with a friend
- Translated to 80 languages
- Customizable and themable
- 100% free, without ads, and opensource!

Get it now from [lichess.org/mobile](http://lichess.org/mobile)

## Requirements

* [node](http://nodejs.org) and [gulp](http://gulpjs.com/) version 3.8.x installed.
* [tarifa](http://tarifa.tools) (version 0.7.1)

**For Android:**

* the [android SDK](http://developer.android.com/sdk/index.html)
* [SDK packages](http://developer.android.com/sdk/installing/adding-packages.html)
for API 14 to API 19
* make sure the `sdk/tools/` directory is in your path, so you can use `android`
  command everywhere.

**For iOS:**

* you need OS X and Xcode (6.x) installed.

## Init project after checkout

    $ tarifa check --force

This will recreate the cordova folder with android and iOS platforms and also
install plugins.

## Build the web application

Make sure you installed all deps:

    $ npm install

Then copy `project/env.json.example` to `project/env.json` and modify settings
to link your app to a lichess server.

To build in dev mode:

    $ gulp

To build in prod mode:

    $ gulp --mode=prod

To build and watch for changes:

    $ gulp watch


## Build and run on your device

Connect your device with USB debugging enabled and:

    $ tarifa run [platform]

This will use the default configuration which use a development lichess server
end point.

Please look at [tarifa documentation](http://42loops.gitbooks.io/tarifa/content/)
for further documentation.
