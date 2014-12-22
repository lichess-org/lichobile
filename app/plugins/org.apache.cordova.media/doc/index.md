<!---
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->

# org.apache.cordova.media

This plugin provides the ability to record and play back audio files on a device.

__NOTE__: The current implementation does not adhere to a W3C
specification for media capture, and is provided for convenience only.
A future implementation will adhere to the latest W3C specification
and may deprecate the current APIs.

This plugin defines a global `Media` Constructor.

Although in the global scope, it is not available until after the `deviceready` event.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(Media);
    }

## Installation

    cordova plugin add org.apache.cordova.media

## Supported Platforms

- Android
- BlackBerry 10
- iOS
- Windows Phone 7 and 8
- Tizen
- Windows 8

## Windows Phone Quirks

- Only one media file can be played back at a time.

- There are strict restrictions on how your application interacts with other media. See the [Microsoft documentation for details][url].

[url]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Media

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);

### Parameters

- __src__: A URI containing the audio content. _(DOMString)_

- __mediaSuccess__: (Optional) The callback that executes after a `Media` object has completed the current play, record, or stop action. _(Function)_

- __mediaError__: (Optional) The callback that executes if an error occurs. _(Function)_

- __mediaStatus__: (Optional) The callback that executes to indicate status changes. _(Function)_

### Constants

The following constants are reported as the only parameter to the
`mediaStatus` callback:

- `Media.MEDIA_NONE`     = 0;
- `Media.MEDIA_STARTING` = 1;
- `Media.MEDIA_RUNNING`  = 2;
- `Media.MEDIA_PAUSED`   = 3;
- `Media.MEDIA_STOPPED`  = 4;

### Methods

- `media.getCurrentPosition`: Returns the current position within an audio file.

- `media.getDuration`: Returns the duration of an audio file.

- `media.play`: Start or resume playing an audio file.

- `media.pause`: Pause playback of an audio file.

- `media.release`: Releases the underlying operating system's audio resources.

- `media.seekTo`: Moves the position within the audio file.

- `media.setVolume`: Set the volume for audio playback.

- `media.startRecord`: Start recording an audio file.

- `media.stopRecord`: Stop recording an audio file.

- `media.stop`: Stop playing an audio file.

### Additional ReadOnly Parameters

- __position__: The position within the audio playback, in seconds.
    - Not automatically updated during play; call `getCurrentPosition` to update.

- __duration__: The duration of the media, in seconds.


## media.getCurrentPosition

Returns the current position within an audio file.  Also updates the `Media` object's `position` parameter.

    media.getCurrentPosition(mediaSuccess, [mediaError]);

### Parameters

- __mediaSuccess__: The callback that is passed the current position in seconds.

- __mediaError__: (Optional) The callback to execute if an error occurs.

### Quick Example

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);

    // Update media position every second
    var mediaTimer = setInterval(function () {
        // get media position
        my_media.getCurrentPosition(
            // success callback
            function (position) {
                if (position > -1) {
                    console.log((position) + " sec");
                }
            },
            // error callback
            function (e) {
                console.log("Error getting pos=" + e);
            }
        );
    }, 1000);


## media.getDuration

Returns the duration of an audio file in seconds. If the duration is unknown, it returns a value of -1.


    media.getDuration();

### Quick Example

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);

    // Get duration
    var counter = 0;
    var timerDur = setInterval(function() {
        counter = counter + 100;
        if (counter > 2000) {
            clearInterval(timerDur);
        }
        var dur = my_media.getDuration();
        if (dur > 0) {
            clearInterval(timerDur);
            document.getElementById('audio_duration').innerHTML = (dur) + " sec";
        }
    }, 100);


## media.pause

Pauses playing an audio file.

    media.pause();


### Quick Example

    // Play audio
    //
    function playAudio(url) {
        // Play the audio file at url
        var my_media = new Media(url,
            // success callback
            function () { console.log("playAudio():Audio Success"); },
            // error callback
            function (err) { console.log("playAudio():Audio Error: " + err); }
        );

        // Play audio
        my_media.play();

        // Pause after 10 seconds
        setTimeout(function () {
            media.pause();
        }, 10000);
    }


## media.play

Starts or resumes playing an audio file.

    media.play();


### Quick Example

    // Play audio
    //
    function playAudio(url) {
        // Play the audio file at url
        var my_media = new Media(url,
            // success callback
            function () {
                console.log("playAudio():Audio Success");
            },
            // error callback
            function (err) {
                console.log("playAudio():Audio Error: " + err);
            }
        );
        // Play audio
        my_media.play();
    }


### iOS Quirks

- __numberOfLoops__: Pass this option to the `play` method to specify
  the number of times you want the media file to play, e.g.:

        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })

- __playAudioWhenScreenIsLocked__: Pass in this option to the `play`
  method to specify whether you want to allow playback when the screen
  is locked.  If set to `true` (the default value), the state of the
  hardware mute button is ignored, e.g.:

        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })

- __order of file search__: When only a file name or simple path is
  provided, iOS searches in the `www` directory for the file, then in
  the application's `documents/tmp` directory:

        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3

## media.release

Releases the underlying operating system's audio resources.
This is particularly important for Android, since there are a finite amount of
OpenCore instances for media playback. Applications should call the `release`
function for any `Media` resource that is no longer needed.

    media.release();


### Quick Example

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);

    my_media.play();
    my_media.stop();
    my_media.release();


## media.seekTo

Sets the current position within an audio file.

    media.seekTo(milliseconds);

### Parameters

- __milliseconds__: The position to set the playback position within the audio, in milliseconds.


### Quick Example

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);


### BlackBerry 10 Quirks

- Not supported on BlackBerry OS 5 devices.

## media.setVolume

Set the volume for an audio file.

    media.setVolume(volume);

### Parameters

- __volume__: The volume to set for playback.  The value must be within the range of 0.0 to 1.0.

### Supported Platforms

- Android
- iOS

### Quick Example

    // Play audio
    //
    function playAudio(url) {
        // Play the audio file at url
        var my_media = new Media(url,
            // success callback
            function() {
                console.log("playAudio():Audio Success");
            },
            // error callback
            function(err) {
                console.log("playAudio():Audio Error: "+err);
        });

        // Play audio
        my_media.play();

        // Mute volume after 2 seconds
        setTimeout(function() {
            my_media.setVolume('0.0');
        }, 2000);

        // Set volume to 1.0 after 5 seconds
        setTimeout(function() {
            my_media.setVolume('1.0');
        }, 5000);
    }


## media.startRecord

Starts recording an audio file.

    media.startRecord();

### Supported Platforms

- Android
- iOS
- Windows Phone 7 and 8
- Windows 8

### Quick Example

    // Record audio
    //
    function recordAudio() {
        var src = "myrecording.mp3";
        var mediaRec = new Media(src,
            // success callback
            function() {
                console.log("recordAudio():Audio Success");
            },

            // error callback
            function(err) {
                console.log("recordAudio():Audio Error: "+ err.code);
            });

        // Record audio
        mediaRec.startRecord();
    }


### Android Quirks

- Android devices record audio in Adaptive Multi-Rate format. The specified file should end with a _.amr_ extension.
- The hardware volume controls are wired up to the media volume while any Media objects are alive. Once the last created Media object has `release()` called on it, the volume controls revert to their default behaviour. The controls are also reset on page navigation, as this releases all Media objects.

### iOS Quirks

- iOS only records to files of type _.wav_ and returns an error if the file name extension is not correct.

- If a full path is not provided, the recording is placed in the application's `documents/tmp` directory. This can be accessed via the `File` API using `LocalFileSystem.TEMPORARY`. Any subdirectory specified at record time must already exist.

- Files can be recorded and played back using the documents URI:

        var myMedia = new Media("documents://beer.mp3")

### Windows 8 Quirks

- If a full path is not provided, the recording is placed in the AppData/temp directory. This can be accessed via the `File` API using `LocalFileSystem.TEMPORARY` or 'ms-appdata:///temp/<filename>' URI.

- Any subdirectory specified at record time must already exist.

### Tizen Quirks

- Not supported on Tizen devices.

## media.stop

Stops playing an audio file.

    media.stop();

### Quick Example

    // Play audio
    //
    function playAudio(url) {
        // Play the audio file at url
        var my_media = new Media(url,
            // success callback
            function() {
                console.log("playAudio():Audio Success");
            },
            // error callback
            function(err) {
                console.log("playAudio():Audio Error: "+err);
            }
        );

        // Play audio
        my_media.play();

        // Pause after 10 seconds
        setTimeout(function() {
            my_media.stop();
        }, 10000);
    }


## media.stopRecord

Stops recording an audio file.

    media.stopRecord();

### Supported Platforms

- Android
- iOS
- Windows Phone 7 and 8
- Windows 8

### Quick Example

    // Record audio
    //
    function recordAudio() {
        var src = "myrecording.mp3";
        var mediaRec = new Media(src,
            // success callback
            function() {
                console.log("recordAudio():Audio Success");
            },

            // error callback
            function(err) {
                console.log("recordAudio():Audio Error: "+ err.code);
            }
        );

        // Record audio
        mediaRec.startRecord();

        // Stop recording after 10 seconds
        setTimeout(function() {
            mediaRec.stopRecord();
        }, 10000);
    }


### Tizen Quirks

- Not supported on Tizen devices.

## MediaError

A `MediaError` object is returned to the `mediaError` callback
function when an error occurs.

### Properties

- __code__: One of the predefined error codes listed below.

- __message__: An error message describing the details of the error.

### Constants

- `MediaError.MEDIA_ERR_ABORTED`        = 1
- `MediaError.MEDIA_ERR_NETWORK`        = 2
- `MediaError.MEDIA_ERR_DECODE`         = 3
- `MediaError.MEDIA_ERR_NONE_SUPPORTED` = 4

