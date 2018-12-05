#!/bin/sh

# android build is failing for now because of an ndk version uncompatible with
# gradle
npm run build-stage # && cordova build android --browserify
