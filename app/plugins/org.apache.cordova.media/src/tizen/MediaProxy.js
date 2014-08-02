/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cordova = require('cordova'),
    Media = require('org.apache.cordova.media.Media');

var MediaError = require('org.apache.cordova.media.MediaError'),
    audioObjects = {};

module.exports = {
    // Initiates the audio file
    create:function(successCallback, errorCallback, args) {
        var id = args[0], src = args[1];

        console.log("media::create() - id =" + id + ", src =" + src);

        audioObjects[id] = new Audio(src);

        audioObjects[id].onStalledCB = function () {
            console.log("media::onStalled()");

            audioObjects[id].timer = window.setTimeout(
                    function () {
                        audioObjects[id].pause();

                        if (audioObjects[id].currentTime !== 0)
                            audioObjects[id].currentTime = 0;

                        console.log("media::onStalled() - MEDIA_ERROR -> " + MediaError.MEDIA_ERR_ABORTED);

                        var err = new MediaError(MediaError.MEDIA_ERR_ABORTED, "Stalled");

                        Media.onStatus(id, Media.MEDIA_ERROR, err);
                    },
                    2000);
        };

        audioObjects[id].onEndedCB = function () {
            console.log("media::onEndedCB() - MEDIA_STATE -> MEDIA_STOPPED");

            Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);
        };

        audioObjects[id].onErrorCB = function () {
            console.log("media::onErrorCB() - MEDIA_ERROR -> " + event.srcElement.error);

            Media.onStatus(id, Media.MEDIA_ERROR, event.srcElement.error);
        };

        audioObjects[id].onPlayCB = function () {
            console.log("media::onPlayCB() - MEDIA_STATE -> MEDIA_STARTING");

            Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);
        };

        audioObjects[id].onPlayingCB = function () {
            console.log("media::onPlayingCB() - MEDIA_STATE -> MEDIA_RUNNING");

            Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_RUNNING);
        };

        audioObjects[id].onDurationChangeCB = function () {
            console.log("media::onDurationChangeCB() - MEDIA_DURATION -> " +  audioObjects[id].duration);

            Media.onStatus(id, Media.MEDIA_DURATION, audioObjects[id].duration);
        };

        audioObjects[id].onTimeUpdateCB = function () {
            console.log("media::onTimeUpdateCB() - MEDIA_POSITION -> " +  audioObjects[id].currentTime);

            Media.onStatus(id, Media.MEDIA_POSITION, audioObjects[id].currentTime);
        };

        audioObjects[id].onCanPlayCB = function () {
            console.log("media::onCanPlayCB()");

            window.clearTimeout(audioObjects[id].timer);

            audioObjects[id].play();
        };

    },

    // Start playing the audio
    startPlayingAudio:function(successCallback, errorCallback, args) {
        var id = args[0], src = args[1], options = args[2];

        console.log("media::startPlayingAudio() - id =" + id + ", src =" + src + ", options =" + options);

        audioObjects[id].addEventListener('canplay', audioObjects[id].onCanPlayCB);
        audioObjects[id].addEventListener('ended', audioObjects[id].onEndedCB);
        audioObjects[id].addEventListener('timeupdate', audioObjects[id].onTimeUpdateCB);
        audioObjects[id].addEventListener('durationchange', audioObjects[id].onDurationChangeCB);
        audioObjects[id].addEventListener('playing', audioObjects[id].onPlayingCB);
        audioObjects[id].addEventListener('play', audioObjects[id].onPlayCB);
        audioObjects[id].addEventListener('error', audioObjects[id].onErrorCB);
        audioObjects[id].addEventListener('stalled', audioObjects[id].onStalledCB);

        audioObjects[id].play();
    },

    // Stops the playing audio
    stopPlayingAudio:function(successCallback, errorCallback, args) {
        var id = args[0];

        window.clearTimeout(audioObjects[id].timer);

        audioObjects[id].pause();

        if (audioObjects[id].currentTime !== 0)
            audioObjects[id].currentTime = 0;

        console.log("media::stopPlayingAudio() - MEDIA_STATE -> MEDIA_STOPPED");

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);

        audioObjects[id].removeEventListener('canplay', audioObjects[id].onCanPlayCB);
        audioObjects[id].removeEventListener('ended', audioObjects[id].onEndedCB);
        audioObjects[id].removeEventListener('timeupdate', audioObjects[id].onTimeUpdateCB);
        audioObjects[id].removeEventListener('durationchange', audioObjects[id].onDurationChangeCB);
        audioObjects[id].removeEventListener('playing', audioObjects[id].onPlayingCB);
        audioObjects[id].removeEventListener('play', audioObjects[id].onPlayCB);
        audioObjects[id].removeEventListener('error', audioObjects[id].onErrorCB);
        audioObjects[id].removeEventListener('error', audioObjects[id].onStalledCB);
    },

    // Seeks to the position in the audio
    seekToAudio:function(successCallback, errorCallback, args) {
        var id = args[0], milliseconds = args[1];

        console.log("media::seekToAudio()");

        audioObjects[id].currentTime = milliseconds;
        successCallback( audioObjects[id].currentTime);
    },

    // Pauses the playing audio
    pausePlayingAudio:function(successCallback, errorCallback, args) {
        var id = args[0];

        console.log("media::pausePlayingAudio() - MEDIA_STATE -> MEDIA_PAUSED");

        audioObjects[id].pause();

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_PAUSED);
    },

    // Gets current position in the audio
    getCurrentPositionAudio:function(successCallback, errorCallback, args) {
        var id = args[0];
        console.log("media::getCurrentPositionAudio()");
        successCallback(audioObjects[id].currentTime);
    },

    // Start recording audio
    startRecordingAudio:function(successCallback, errorCallback, args) {
        var id = args[0], src = args[1];

        console.log("media::startRecordingAudio() - id =" + id + ", src =" + src);

        function gotStreamCB(stream) {
            audioObjects[id].src = webkitURL.createObjectURL(stream);
            console.log("media::startRecordingAudio() - stream CB");
        }

        function gotStreamFailedCB(error) {
            console.log("media::startRecordingAudio() - error CB:" + error.toString());
        }

        if (navigator.webkitGetUserMedia) {
            audioObjects[id] = new Audio();
            navigator.webkitGetUserMedia('audio', gotStreamCB, gotStreamFailedCB);
        } else {
            console.log("webkitGetUserMedia not supported");
        }
        successCallback();
    },

    // Stop recording audio
    stopRecordingAudio:function(successCallback, errorCallback, args) {
        var id = args[0];

        console.log("media::stopRecordingAudio() - id =" + id);

        audioObjects[id].pause();
        successCallback();
    },

    // Release the media object
    release:function(successCallback, errorCallback, args) {
        var id = args[0];
        window.clearTimeout(audioObjects[id].timer);
        console.log("media::release()");
    },

    setVolume:function(successCallback, errorCallback, args) {
        var id = args[0], volume = args[1];

        console.log("media::setVolume()");

        audioObjects[id].volume = volume;
    }
};

require("cordova/tizen/commandProxy").add("Media", module.exports);
