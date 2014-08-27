lichobile
=========

lichess.org mobile application

## Requirements

* [node](http://nodejs.org) and [gulp](http://gulpjs.com/) installed.

**For Android:**

* the [android SDK](http://developer.android.com/sdk/index.html)
* [SKD packages](http://developer.android.com/sdk/installing/adding-packages.html)
for API 14 to API 19
* make sure the `sdk/tools/` directory is in your path, so you can use `android`
  command everywhere.

**For iOs:**

* you need mac os and Xcode installed.


## Android instructions

Minimum version supported is 4.0.

### Run on your device

Following commands are executed from project root.

First, link your SDK to the project:

    $ android update project --target 19 -p app/ -s

Copy `env/mobile.json.example` to `env/mobile.json` and update according to your
env.

Then plug your device with USB, check that usb debugging is enabled on it.

You're all set! You can now run

    $ bin/android your_env


## iOs instructions

Copy `env/mobile.json.example` to `env/your_env.json` and update according to your
env.

Generate assets and compile:

    $ bin/ios your_env

Then open the xcode project at `app/platforms/ios/lichess-mobile.xcodeproj` and
run the ios emulator.
