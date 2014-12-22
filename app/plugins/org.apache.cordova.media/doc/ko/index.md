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

이 플러그인 기록 장치에 오디오 파일을 재생 하는 기능을 제공 합니다.

**참고**: 현재 구현 미디어 캡처에 대 한 W3C 사양을 준수 하지 않는 및 편의 위해서만 제공 됩니다. 미래 구현 최신 W3C 사양을 준수 한다 고 현재 Api 사용 중지 될 수 있습니다.

## 설치

    cordova plugin add org.apache.cordova.media
    

## 지원 되는 플랫폼

*   안 드 로이드
*   블랙베리 10
*   iOS
*   Windows Phone 7과 8
*   Tizen
*   윈도우 8

## Windows Phone 단점

*   한 번에 하나의 미디어 파일을 다시 재생할 수 있습니다.

*   응용 프로그램 다른 미디어와 상호 작용 하는 방법에 대 한 엄격한 제한이 있다. [자세한 내용은 Microsoft 문서][1] 를 참조 하십시오.

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## 미디어

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### 매개 변수

*   **src**: 오디오 콘텐츠를 포함 하는 URI. *(DOMString)*

*   **mediaSuccess**: (선택 사항) 후 실행 되는 콜백 한 `Media` 개체 현재 재생, 기록, 또는 중지 작업을 완료 했습니다. *(기능)*

*   **mediaError**: (선택 사항) 오류가 발생 하면 실행 되는 콜백. *(기능)*

*   **mediaStatus**: (선택 사항) 상태 변화를 나타내기 위해 실행 하는 콜백. *(기능)*

### 상수

다음 상수를 유일한 매개 변수로 보고 되는 `mediaStatus` 콜백:

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### 메서드

*   `media.getCurrentPosition`: 오디오 파일 내에서 현재 위치를 반환합니다.

*   `media.getDuration`: 오디오 파일의 기간을 반환합니다.

*   `media.play`: 시작 또는 오디오 파일 재생을 다시 시작 합니다.

*   `media.pause`: 오디오 파일의 재생을 일시 중지 합니다.

*   `media.release`: 기본 운영 체제의 오디오 리소스를 해제합니다.

*   `media.seekTo`: 오디오 파일 내에서 위치를 이동합니다.

*   `media.setVolume`: 오디오 재생 볼륨을 설정 합니다.

*   `media.startRecord`: 오디오 파일을 녹음을 시작 합니다.

*   `media.stopRecord`: 오디오 파일 기록을 중지 합니다.

*   `media.stop`: 오디오 파일 재생을 중지 합니다.

### 추가 읽기 전용 매개 변수

*   **위치**: 위치 오디오 재생 시간 (초).
    
    *   플레이; 하는 동안 자동으로 업데이트 전화 `getCurrentPosition` 를 업데이트 합니다.

*   **기간**: 기간, 매체의 초.

## media.getCurrentPosition

오디오 파일 내에서 현재 위치를 반환합니다. 또한 업데이트는 `Media` 개체의 `position` 매개 변수.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### 매개 변수

*   **mediaSuccess**: 현재 위치 (초) 전달 되는 콜백.

*   **mediaError**: (선택 사항) 콜백 실행 오류가 발생 하는 경우에.

### 빠른 예제

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

초 오디오 파일의 기간을 반환합니다. 기간을 알 수 없는 경우-1 값을 반환 합니다.

    media.getDuration();
    

### 빠른 예제

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

오디오 파일 재생을 일시 중지 합니다.

    media.pause();
    

### 빠른 예제

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

시작 또는 오디오 파일 재생을 다시 시작 합니다.

    media.play();
    

### 빠른 예제

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
    

### iOS 단점

*   **numberOfLoops**:이 옵션을 전달할는 `play` 시간을 재생 하려면, 예를 들어 미디어 파일의 수를 지정 하는 방법:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**:이 옵션을 전달할는 `play` 메서드는 화면이 잠겨 때 재생 수 있도록 지정 하려면. 만약 설정 `true` (기본값) 하드웨어 음소거 버튼의 상태, 예를 들면 무시 됩니다:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **파일 검색의 순서**: iOS에서 검색 한 파일 이름 또는 간단한 경로 제공 하는 경우는 `www` 파일을 다음 응용 프로그램의 디렉터리 `documents/tmp` 디렉터리:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

기본 운영 체제의 오디오 리소스를 해제합니다. 이것은 유한 양의 미디어 재생용 OpenCore 인스턴스 때문에 안 드 로이드를 위해 특히 중요 하다입니다. 응용 프로그램 호출 해야는 `release` 함수에 대 한 `Media` 리소스를 더 이상 필요 합니다.

    media.release();
    

### 빠른 예제

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

오디오 파일 내의 현재 위치를 설정합니다.

    media.seekTo(milliseconds);
    

### 매개 변수

*   **밀리초**: 밀리초에서는 오디오에서 재생 위치를 설정 하는 위치.

### 빠른 예제

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### 블랙베리 10 단점

*   블랙베리 OS 5 장치에서 지원 되지 않습니다.

## media.setVolume

오디오 파일의 볼륨을 설정 합니다.

    media.setVolume(volume);
    

### 매개 변수

*   **볼륨**: 볼륨 재생을 위한 설정. 값은 0.0에서 1.0의 범위 내에서 해야 합니다.

### 지원 되는 플랫폼

*   안 드 로이드
*   iOS

### 빠른 예제

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

오디오 파일 녹음을 시작 합니다.

    media.startRecord();
    

### 지원 되는 플랫폼

*   안 드 로이드
*   iOS
*   Windows Phone 7과 8
*   윈도우 8

### 빠른 예제

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
    

### 안 드 로이드 단점

*   안 드 로이드 장치 적응 다중 속도 형식에서 오디오를 기록합니다. 지정 된 파일 *.amr* 확장명으로 끝나야 합니다.

### iOS 단점

*   iOS만 레코드 형식을 *.wav* 및 반환 오류 경우 파일 이름 확장명의 파일을 수정 하지.

*   전체 경로 제공 하지 않으면 응용 프로그램의 기록 배치 됩니다 `documents/tmp` 디렉터리. 이 통해 액세스할 수 있는 `File` API를 사용 하 여 `LocalFileSystem.TEMPORARY` . 기록 시간에 지정 된 하위 디렉터리에 이미 존재 해야 합니다.

*   파일을 기록 하 고 재생할 수 있습니다 문서 URI를 사용 하 여 다시:
    
        var myMedia = new Media("documents://beer.mp3")
        

### 윈도우 8 단점

*   전체 경로 제공 하지 않으면 녹음 AppData/temp 디렉터리에 배치 됩니다. 이 통해 액세스할 수 있는 `파일` API를 사용 하 여 `LocalFileSystem.TEMPORARY` 또는 ' ms appdata: 온도 / / / /<filename>' URI.

*   기록 시간에 지정 된 하위 디렉터리에 이미 존재 해야 합니다.

### Tizen 특수

*   Tizen 장치에서 지원 되지 않습니다.

## media.stop

오디오 파일 재생을 중지 합니다.

    media.stop();
    

### 빠른 예제

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

오디오 파일 녹음을 중지 합니다.

    media.stopRecord();
    

### 지원 되는 플랫폼

*   안 드 로이드
*   iOS
*   Windows Phone 7과 8
*   윈도우 8

### 빠른 예제

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
    

### Tizen 특수

*   Tizen 장치에서 지원 되지 않습니다.

## MediaError

A `MediaError` 개체에 반환 됩니다는 `mediaError` 콜백 함수 오류가 발생 합니다.

### 속성

*   **코드**: 미리 정의 된 오류 코드 중 하나가 아래에 나열 된.

*   **메시지**: 오류 세부 정보를 설명 하는 오류 메시지.

### 상수

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4