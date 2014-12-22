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

exports.defineAutoTests = function () {
    var failed = function (done, msg, error) {
        var info = typeof msg == 'undefined' ? 'Unexpected error callback' : msg;
        expect(true).toFailWithMessage(info + '\n' + JSON.stringify(error));
        done();
    };

    var succeed = function (done, msg) {
        var info = typeof msg == 'undefined' ? 'Unexpected success callback' : msg;
        expect(true).toFailWithMessage(info);
        done();
    };

    describe('Media', function () {

        beforeEach(function () {
            // Custom Matcher
            jasmine.Expectation.addMatchers({
                toFailWithMessage : function () {
                    return {
                        compare : function (error, message) {
                            var pass = false;
                            return {
                                pass : pass,
                                message : message
                            };
                        }
                    };
                }
            });
        });

        it("media.spec.1 should exist", function () {
            expect(Media).toBeDefined();
            expect(typeof Media).toBe("function");
        });

        it("media.spec.2 should have the following properties", function () {
            var media1 = new Media("dummy");
            expect(media1.id).toBeDefined();
            expect(media1.src).toBeDefined();
            expect(media1._duration).toBeDefined();
            expect(media1._position).toBeDefined();
            media1.release();
        });

        it("media.spec.3 should define constants for Media status", function () {
            expect(Media).toBeDefined();
            expect(Media.MEDIA_NONE).toBe(0);
            expect(Media.MEDIA_STARTING).toBe(1);
            expect(Media.MEDIA_RUNNING).toBe(2);
            expect(Media.MEDIA_PAUSED).toBe(3);
            expect(Media.MEDIA_STOPPED).toBe(4);
        });

        it("media.spec.4 should define constants for Media errors", function () {
            expect(MediaError).toBeDefined();
            expect(MediaError.MEDIA_ERR_NONE_ACTIVE).toBe(0);
            expect(MediaError.MEDIA_ERR_ABORTED).toBe(1);
            expect(MediaError.MEDIA_ERR_NETWORK).toBe(2);
            expect(MediaError.MEDIA_ERR_DECODE).toBe(3);
            expect(MediaError.MEDIA_ERR_NONE_SUPPORTED).toBe(4);
        });

        it("media.spec.5 should contain a play function", function () {
            var media1 = new Media();
            expect(media1.play).toBeDefined();
            expect(typeof media1.play).toBe('function');
            media1.release();
        });

        it("media.spec.6 should contain a stop function", function () {
            var media1 = new Media();
            expect(media1.stop).toBeDefined();
            expect(typeof media1.stop).toBe('function');
            media1.release();
        });

        it("media.spec.7 should contain a seekTo function", function () {
            var media1 = new Media();
            expect(media1.seekTo).toBeDefined();
            expect(typeof media1.seekTo).toBe('function');
            media1.release();
        });

        it("media.spec.8 should contain a pause function", function () {
            var media1 = new Media();
            expect(media1.pause).toBeDefined();
            expect(typeof media1.pause).toBe('function');
            media1.release();
        });

        it("media.spec.9 should contain a getDuration function", function () {
            var media1 = new Media();
            expect(media1.getDuration).toBeDefined();
            expect(typeof media1.getDuration).toBe('function');
            media1.release();
        });

        it("media.spec.10 should contain a getCurrentPosition function", function () {
            var media1 = new Media();
            expect(media1.getCurrentPosition).toBeDefined();
            expect(typeof media1.getCurrentPosition).toBe('function');
            media1.release();
        });

        it("media.spec.11 should contain a startRecord function", function () {
            var media1 = new Media();
            expect(media1.startRecord).toBeDefined();
            expect(typeof media1.startRecord).toBe('function');
            media1.release();
        });

        it("media.spec.12 should contain a stopRecord function", function () {
            var media1 = new Media();
            expect(media1.stopRecord).toBeDefined();
            expect(typeof media1.stopRecord).toBe('function');
            media1.release();
        });

        it("media.spec.13 should contain a release function", function () {
            var media1 = new Media();
            expect(media1.release).toBeDefined();
            expect(typeof media1.release).toBe('function');
            media1.release();
        });

        it("media.spec.14 should contain a setVolume function", function () {
            var media1 = new Media();
            expect(media1.setVolume).toBeDefined();
            expect(typeof media1.setVolume).toBe('function');
            media1.release();
        });

        it("media.spec.15 should return MediaError for bad filename", function (done) {
            var fileName = 'invalid.file.name';
            //Error callback it has an unexpected behavior under Windows Phone,
            //it enters to the error callback several times, instead of just one walk-through
            //JIRA issue related with all details: CB-7092
            //the conditional statement should be removed once the issue is fixed.

            //bb10 dialog pops up, preventing tests from running
            if (cordova.platformId === 'blackberry10' || cordova.platformId === 'windowsphone') {
                expect(true).toFailWithMessage('Platform does not support this feature');
                done();
            } else {
                var badMedia = null;
                badMedia = new Media(fileName, succeed.bind(null, done, ' badMedia = new Media , Unexpected succees callback, it should not create Media object with invalid file name'), function (result) {
                        expect(result).toBeDefined();
                        expect(result.code).toBe(MediaError.MEDIA_ERR_ABORTED);
                        if (badMedia !== null) {
                            badMedia.release();
                        }
                        done();
                    });
                badMedia.play();
            }
        });

        it("media.spec.16 position should be set properly", function (done) {
            var mediaFile = 'http://cordova.apache.org/downloads/BlueZedEx.mp3',
            mediaState = Media.MEDIA_STOPPED,
            successCallback,
            flag = true,
            statusChange = function (statusCode) {
                if (statusCode == Media.MEDIA_RUNNING && flag) {
                    //flag variable used to ensure an extra security statement to ensure that the callback is processed only once,
                    //in case for some reason the statusChange callback is reached more than one time with the same status code.
                    //Some information about this kind of behavior it can be found at JIRA: CB-7099
                    flag = false;
                    setTimeout(function () {
                        media1.getCurrentPosition(function (position) {
                            expect(position).toBeGreaterThan(0.0);
                            media1.stop();
                            media1.release();
                            done();
                        }, failed.bind(null, done, 'media1.getCurrentPosition - Error getting media current position'));
                    }, 1000);
                }
            },
            media1 = new Media(mediaFile, successCallback, failed.bind(null, done, 'media1 = new Media - Error creating Media object. Media file: ' + mediaFile), statusChange);
            media1.play();
        });

        it("media.spec.17 duration should be set properly", function (done) {
            if (cordova.platformId === 'blackberry10') {
                expect(true).toFailWithMessage('Platform does not supported this feature');
                done();
            }
            var mediaFile = 'http://cordova.apache.org/downloads/BlueZedEx.mp3',
            mediaState = Media.MEDIA_STOPPED,
            successCallback,
            flag = true,
            statusChange = function (statusCode) {
                if (statusCode == Media.MEDIA_RUNNING && flag) {
                    //flag variable used to ensure an extra security statement to ensure that the callback is processed only once,
                    //in case for some reason the statusChange callback is reached more than one time with the same status code.
                    //Some information about this kind of behavior it can be found at JIRA: CB-7099.
                    flag = false;
                    setTimeout(function () {
                        expect(media1.getDuration()).toBeGreaterThan(0.0);
                        media1.stop();
                        media1.release();
                        done();
                    }, 1000);
                }
            },
            media1 = new Media(mediaFile, successCallback, failed.bind(null, done, 'media1 = new Media - Error creating Media object. Media file: ' + mediaFile), statusChange);
            media1.play();
        });
    });
};

//******************************************************************************************
//***************************************Manual Tests***************************************
//******************************************************************************************

exports.defineManualTests = function (contentEl, createActionButton) {
    //-------------------------------------------------------------------------
    // Audio player
    //-------------------------------------------------------------------------
    var media1 = null;
    var media1Timer = null;
    var audioSrc = null;
    var defaultaudio = "http://cordova.apache.org/downloads/BlueZedEx.mp3";

    //Play audio function
    function playAudio(url) {
        console.log("playAudio()");
        console.log(" -- media=" + media1);

        var src = defaultaudio;

        if (url) {
            src = url;
        }

        // Stop playing if src is different from currently playing source
        if (src !== audioSrc) {
            if (media1 !== null) {
                stopAudio();
                media1 = null;
            }
        }

        if (media1 === null) {

            // TEST STREAMING AUDIO PLAYBACK
            //var src = "http://nunzioweb.com/misc/Bon_Jovi-Crush_Mystery_Train.mp3";   // works
            //var src = "http://nunzioweb.com/misc/Bon_Jovi-Crush_Mystery_Train.m3u"; // doesn't work
            //var src = "http://www.wav-sounds.com/cartoon/bugsbunny1.wav"; // works
            //var src = "http://www.angelfire.com/fl5/html-tutorial/a/couldyou.mid"; // doesn't work
            //var src = "MusicSearch/mp3/train.mp3";    // works
            //var src = "bryce.mp3";  // works
            //var src = "/android_asset/www/bryce.mp3"; // works

            media1 = new Media(src,
                    function () {
                    console.log("playAudio():Audio Success");
                },
                    function (err) {
                    console.log("playAudio():Audio Error: " + err.code);
                    setAudioStatus("Error: " + err.code);
                },
                    function (status) {
                    console.log("playAudio():Audio Status: " + status);
                    setAudioStatus(Media.MEDIA_MSG[status]);

                    // If stopped, then stop getting current position
                    if (Media.MEDIA_STOPPED == status) {
                        clearInterval(media1Timer);
                        media1Timer = null;
                        setAudioPosition("0 sec");
                    }
                });
        }
        audioSrc = src;
        document.getElementById('durationValue').innerHTML = "";
        // Play audio
        media1.play();
        if (media1Timer === null && media1.getCurrentPosition) {
            media1Timer = setInterval(
                    function () {
                    media1.getCurrentPosition(
                        function (position) {
                        if (position >= 0.0) {
                            setAudioPosition(position + " sec");
                        }
                    },
                        function (e) {
                        console.log("Error getting pos=" + e);
                        setAudioPosition("Error: " + e);
                    });
                },
                    1000);
        }

        // Get duration
        var counter = 0;
        var timerDur = setInterval(
                function () {
                counter = counter + 100;
                if (counter > 2000) {
                    clearInterval(timerDur);
                }
                var dur = media1.getDuration();
                if (dur > 0) {
                    clearInterval(timerDur);
                    document.getElementById('durationValue').innerHTML = dur + " sec";
                }
            }, 100);
    }

    //Pause audio playback
    function pauseAudio() {
        console.log("pauseAudio()");
        if (media1) {
            media1.pause();
        }
    }

    //Stop audio
    function stopAudio() {
        console.log("stopAudio()");
        if (media1) {
            media1.stop();
        }
        clearInterval(media1Timer);
        media1Timer = null;
    }

    //Release audio
    function releaseAudio() {
        console.log("releaseAudio()");
        if (media1) {
            media1.stop(); //imlied stop of playback, resets timer
            media1.release();
        }
    }

    //Set audio status
    function setAudioStatus(status) {
        document.getElementById('statusValue').innerHTML = status;
    }

    //Set audio position
    function setAudioPosition(position) {
        document.getElementById('positionValue').innerHTML = position;
    }

    //Seek audio
    function seekAudio(mode) {
        var time = document.getElementById("seekInput").value;
        if (time === "") {
            time = 5000;
        } else {
            time = time * 1000; //we expect the input to be in seconds
        }
        if (media1 === null) {
            console.log("seekTo requested while media1 is null");
            if (audioSrc === null) {
                audioSrc = defaultaudio;
            }
            media1 = new Media(audioSrc,
                    function () {
                    console.log("seekToAudio():Audio Success");
                },
                    function (err) {
                    console.log("seekAudio():Audio Error: " + err.code);
                    setAudioStatus("Error: " + err.code);
                },
                    function (status) {
                    console.log("seekAudio():Audio Status: " + status);
                    setAudioStatus(Media.MEDIA_MSG[status]);

                    // If stopped, then stop getting current position
                    if (Media.MEDIA_STOPPED == status) {
                        clearInterval(media1Timer);
                        media1Timer = null;
                        setAudioPosition("0 sec");
                    }
                });
        }

        media1.getCurrentPosition(
            function (position) {
            var deltat = time;
            if (mode === "by") {
                deltat = time + position * 1000;
            }
            media1.seekTo(deltat,
                function () {
                console.log("seekAudioTo():Audio Success");
                //force an update on the position display
                updatePosition();
            },
                function (err) {
                console.log("seekAudioTo():Audio Error: " + err.code);
            });
        },
            function (e) {
            console.log("Error getting pos=" + e);
            setAudioPosition("Error: " + e);
        });
    }

    //for forced updates of position after a successful seek

    function updatePosition() {
        media1.getCurrentPosition(
            function (position) {
            if (position >= 0.0) {
                setAudioPosition(position + " sec");
            }
        },
            function (e) {
            console.log("Error getting pos=" + e);
            setAudioPosition("Error: " + e);
        });
    }

    //-------------------------------------------------------------------------
    // Audio recorder
    //-------------------------------------------------------------------------
    var mediaRec = null;
    var recTime = 0;
    var recordSrc = "myRecording.mp3";

    //Record audio
    function recordAudio() {
        console.log("recordAudio()");
        console.log(" -- media=" + mediaRec);
        if (mediaRec == null) {
            var src = recordSrc;
            mediaRec = new Media(src,
                    function () {
                    console.log("recordAudio():Audio Success");
                },
                    function (err) {
                    console.log("recordAudio():Audio Error: " + err.code);
                    setAudioStatus("Error: " + err.code);
                },
                    function (status) {
                    console.log("recordAudio():Audio Status: " + status);
                    setAudioStatus(Media.MEDIA_MSG[status]);
                });
        }

        // Record audio
        mediaRec.startRecord();

        // Stop recording after 10 sec
        recTime = 0;
        var recInterval = setInterval(function () {
                recTime = recTime + 1;
                setAudioPosition(recTime + " sec");
                if (recTime >= 10) {
                    clearInterval(recInterval);
                    if (mediaRec.stopAudioRecord) {
                        mediaRec.stopAudioRecord();
                    } else {
                        mediaRec.stopRecord();
                    }
                    console.log("recordAudio(): stop");
                }
            }, 1000);
    }

    //Play back recorded audio
    function playRecording() {
        playAudio(recordSrc);
    }

    //Function to create a file for iOS recording

    function getRecordSrc() {
        var fsFail = function (error) {
            console.log("error creating file for iOS recording");
        };
        var gotFile = function (file) {
            recordSrc = file.fullPath;
            //console.log("recording Src: " + recordSrc);
        };
        var gotFS = function (fileSystem) {
            fileSystem.root.getFile("iOSRecording.wav", {
                create : true
            }, gotFile, fsFail);
        };
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fsFail);
    }

    //Function to create a file for BB recording
    function getRecordSrcBB() {
        var fsFail = function (error) {
            console.log("error creating file for BB recording");
        };
        var gotFile = function (file) {
            recordSrc = file.fullPath;
        };
        var gotFS = function (fileSystem) {
            fileSystem.root.getFile("BBRecording.amr", {
                create : true
            }, gotFile, fsFail);
        };
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fsFail);
    }

    //Function to create a file for Windows recording
    function getRecordSrcWin() {
        var fsFail = function (error) {
            console.log("error creating file for Win recording");
        };
        var gotFile = function (file) {
            recordSrc = file.fullPath.replace(/\//g, '\\');
        };
        var gotFS = function (fileSystem) {
            fileSystem.root.getFile("WinRecording.m4a", {
                create: true
            }, gotFile, fsFail);
        };
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fsFail);
    }

//Generate Dynamic Table
    function generateTable(tableId, rows, cells, elements) {
        var table = document.createElement('table');
        for (var r = 0; r < rows; r++) {
            var row = table.insertRow(r);
            for (var c = 0; c < cells; c++) {
                var cell = row.insertCell(c);
                cell.setAttribute("align", "center");
                for (var e in elements) {
                    if (elements[e].position.row == r && elements[e].position.cell == c) {
                        var htmlElement = document.createElement(elements[e].tag);
                        var content;

                        if (elements[e].content !== "") {
                            content = document.createTextNode(elements[e].content);
                            htmlElement.appendChild(content);
                        }
                        if (elements[e].type) {
                            htmlElement.type = elements[e].type;
                        }
                        htmlElement.setAttribute("id", elements[e].id);
                        cell.appendChild(htmlElement);
                    }
                }
            }
        }
        table.setAttribute("align", "center");
        table.setAttribute("id", tableId);
        return table;
    }
    
//Audio && Record Elements
    var elementsResultsAudio= 
    [{
            id : "statusTag",
            content : "Status:",
            tag : "div",
            position : {
                row : 0,
                cell : 0
            }
        }, {
            id : "statusValue",
            content : "",
            tag : "div",
            position : {
                row : 0,
                cell : 2
            }
        }, {
            id : "durationTag",
            content : "Duration:",
            tag : "div",
            position : {
                row : 1,
                cell : 0
            }
        }, {
            id : "durationValue",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 2
            }
        }, {
            id : "positionTag",
            content : "Position:",
            tag : "div",
            position : {
                row : 2,
                cell : 0
            }
        }, {
            id : "positionValue",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 2
            }
        }],
        elementsAudio =
        [{
            id : "playBtn",
            content : "",
            tag : "div",
            position : {
                row : 0,
                cell : 0
            }
        }, {
            id : "pauseBtn",
            content : "",
            tag : "div",
            position : {
                row : 0,
                cell : 1
            }
        }, {
            id : "stopBtn",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 0
            }
        }, {
            id : "releaseBtn",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 1
            }
        }, {
            id : "seekByBtn",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 0
            }
        }, {
            id : "seekToBtn",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 1
            }
        }, {
            id : "seekInput",
            content : "",
            tag : "input",
            type : "number",
            position : {
                row : 2,
                cell : 2
            }
        }
    ],
    elementsRecord =
        [{
            id : "recordbtn",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 0
            }
        }, {
            id : "recordplayBtn",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 1
            }
        }, {
            id : "recordpauseBtn",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 0
            }
        }, {
            id : "recordstopBtn",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 1
            }
        }
    ];
    
    //Title audio results
    var div = document.createElement('h2');
    div.appendChild(document.createTextNode('Audio'));
    div.setAttribute("align", "center");
    contentEl.appendChild(div);
    //Generate and add results table
    contentEl.appendChild(generateTable('info', 3, 3, elementsResultsAudio));
    
    //Title audio actions
    div = document.createElement('h2');
    div.appendChild(document.createTextNode('Actions'));
    div.setAttribute("align", "center");
    contentEl.appendChild(div);
    //Generate and add buttons table
    contentEl.appendChild(generateTable('audioActions', 3, 3, elementsAudio));
    createActionButton('Play', function () {
        playAudio();
    }, 'playBtn');
    createActionButton('Pause', function () {
        pauseAudio();
    }, 'pauseBtn');
    createActionButton('Stop', function () {
        stopAudio();
    }, 'stopBtn');
    createActionButton('Release', function () {
        releaseAudio();
    }, 'releaseBtn');
    createActionButton('Seek By', function () {
        seekAudio('by');
    }, 'seekByBtn');
    createActionButton('Seek To', function () {
        seekAudio('to');
    }, 'seekToBtn');
    //get Special path to record if iOS || Blackberry
    if (cordova.platformId === 'ios')
        getRecordSrc();
    else if (cordova.platformId === 'blackberry')
        getRecordSrcBB();
    else if (cordova.platformId === 'windows' || cordova.platformId === 'windows8')
        getRecordSrcWin();

    //testing process and details
    function addItemToList(_list, _text)
    {
        var item = document.createElement('li');
        item.appendChild(document.createTextNode(_text));
        _list.appendChild(item);
    }

    div = document.createElement('h4');
    div.appendChild(document.createTextNode('Recommended Test Procedure'));
    contentEl.appendChild(div);

    var list = document.createElement('ol');
    addItemToList(list, 'Press play - Will start playing audio. Status: Running, Duration: 61.333 sec, Position: Current position of audio track');
    addItemToList(list, 'Press pause - Will pause the audio. Status: Paused, Duration: 61.333 sec, Position: Position where track was paused');
    addItemToList(list, 'Press play - Will begin playing where track left off from the pause');
    addItemToList(list, 'Press stop - Will stop the audio. Status: Stopped, Duration: 61.333 sec, Position: 0 sec');
    addItemToList(list, 'Press play - Will begin playing the audio track from the beginning');
    addItemToList(list, 'Press release - Will stop the audio. Status: Stopped, Duration: 61.333 sec, Position: 0 sec');
    addItemToList(list, 'Press play - Will begin playing the audio track from the beginning');
    addItemToList(list, 'Type 10 in the text box beside Seek To button');
    addItemToList(list, 'Press seek by - Will jump 10 seconds ahead in the audio track. Position: should jump by 10 sec');
    addItemToList(list, 'Press stop if track is not already stopped');
    addItemToList(list, 'Type 30 in the text box beside Seek To button');
    addItemToList(list, 'Press play then seek to - Should jump to Position 30 sec');
    addItemToList(list, 'Press stop');
    addItemToList(list, 'Type 5 in the text box beside Seek To button');
    addItemToList(list, 'Press play, let play past 10 seconds then press seek to - should jump back to position 5 sec');

    div = document.createElement('div');
    div.setAttribute("style", "background:#B0C4DE;border:1px solid #FFA07A;margin:15px 6px 0px;min-width:295px;max-width:97%;padding:4px 0px 2px 10px;min-height:160px;max-height:200px;overflow:auto");
    div.appendChild(list);
    contentEl.appendChild(div);
    
    //Title Record Audio
    div = document.createElement('h2');
    div.appendChild(document.createTextNode('Record Audio'));
    div.setAttribute("align", "center");
    contentEl.appendChild(div);
    //Generate and add Record buttons table
    contentEl.appendChild(generateTable('recordContent', 3, 3, elementsRecord));
    createActionButton('Record Audio \n 10 sec', function () {
        recordAudio();
    }, 'recordbtn');
    createActionButton('Play', function () {
        playRecording();
    }, 'recordplayBtn');
    createActionButton('Pause', function () {
        pauseAudio();
    }, 'recordpauseBtn');
    createActionButton('Stop', function () {
        stopAudio();
    }, 'recordstopBtn');

    //testing process and details
    div = document.createElement('h4');
    div.appendChild(document.createTextNode('Recommended Test Procedure'));
    contentEl.appendChild(div);

    list = document.createElement('ol');
    addItemToList(list, 'Press Record Audio 10 sec - Will start recording audio for 10 seconds. Status: Running, Position: number of seconds recorded (will stop at 10)');
    addItemToList(list, 'Status will change to Stopped when finished recording');
    addItemToList(list, 'Press play - Will begin playing the recording. Status: Running, Duration: # of seconds of recording, Position: Current position of recording');
    addItemToList(list, 'Press stop - Will stop playing the recording. Status: Stopped, Duration: # of seconds of recording, Position: 0 sec');
    addItemToList(list, 'Press play - Will begin playing the recording from the beginning');
    addItemToList(list, 'Press pause - Will pause the playback of the recording. Status: Paused, Duration: # of seconds of recording, Position: Position where recording was paused');
    addItemToList(list, 'Press play - Will begin playing the recording from where it was paused');

    div = document.createElement('div');
    div.setAttribute("style", "background:#B0C4DE;border:1px solid #FFA07A;margin:15px 6px 0px;min-width:295px;max-width:97%;padding:4px 0px 2px 10px;min-height:160px;max-height:200px;overflow:auto");
    div.appendChild(list);
    contentEl.appendChild(div);
};
