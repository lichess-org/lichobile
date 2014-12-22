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

這個外掛程式提供錄製和播放設備上的音訊檔的能力。

**注**： 當前的實現並不遵循 W3C 規範的媒體捕獲和僅用於提供方便。 將來的實現將堅持以最新的 W3C 規範和可能棄用當前 Api。

## 安裝

    cordova plugin add org.apache.cordova.media
    

## 支援的平臺

*   Android 系統
*   黑莓 10
*   iOS
*   Windows Phone 7 和 8
*   Tizen
*   Windows 8

## Windows Phone 怪癖

*   只有一個媒體檔案，可以播放一次。

*   沒有嚴格限制對您的應用程式與其他媒體的對話模式。 請參見[Microsoft 文檔的詳細資訊][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## 媒體

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### 參數

*   **src**： 包含音訊內容的 URI。*() DOMString*

*   **mediaSuccess**： （可選） 後執行的回檔 `Media` 物件已完成當前戲劇、 記錄或停止行動。*（函數）*

*   **mediaError**： （可選） 如果錯誤發生時執行的回檔。*（函數）*

*   **mediaStatus**： （可選） 執行以指示狀態的更改的回檔。*（函數）*

### 常量

以下常量作為唯一的參數到據報告 `mediaStatus` 回檔：

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED`= 3 ；
*   `Media.MEDIA_STOPPED`= 4 ；

### 方法

*   `media.getCurrentPosition`： 返回一個音訊檔內的當前位置。

*   `media.getDuration`： 返回一個音訊檔的持續時間。

*   `media.play`： 啟動或繼續播放音訊檔。

*   `media.pause`： 暫停播放的音訊檔。

*   `media.release`： 釋放底層作業系統的音訊資源。

*   `media.seekTo`： 在音訊檔內移動的位置。

*   `media.setVolume`： 設置音訊播放的音量。

*   `media.startRecord`： 開始錄製的音訊檔。

*   `media.stopRecord`： 停止錄製的音訊檔。

*   `media.stop`： 停止播放音訊檔。

### 附加唯讀參數

*   **位置**： 內音訊播放，以秒為單位的位置。
    
    *   不會自動更新期間播放 ；調用 `getCurrentPosition` 來更新。

*   **持續時間**: 媒體的持續時間以秒為單位。

## media.getCurrentPosition

返回一個音訊檔內的當前位置。此外可以更新 `Media` 物件的 `position` 參數。

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### 參數

*   **mediaSuccess**： 傳遞的當前的位置，以秒為單位的回檔。

*   **mediaError**： （可選） 回檔執行如果發生錯誤。

### 快速的示例

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

以秒為單位返回一個音訊檔的持續時間。如果持續時間是未知的則傳回值為-1。

    media.getDuration();
    

### 快速的示例

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

暫停播放音訊檔。

    media.pause();
    

### 快速的示例

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

開始或重新開始播放音訊檔。

    media.play();
    

### 快速的示例

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
    

### iOS 的怪癖

*   **numberOfLoops**： 傳遞到此選項 `play` 方法，以指定的次數，你想讓媒體檔案以播放，例如：
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**： 通過此選項可在 `play` 方法，以指定您是否要允許播放時螢幕鎖定。 如果設置為 `true` （預設值），將忽略硬體靜音按鈕的狀態，例如：
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **檔搜索順序**： 當只有一個檔的名稱或簡單路徑提供時，搜索中的 iOS `www` 目錄為該檔，然後在應用程式中的 `documents/tmp` 目錄：
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

釋放底層作業系統的音訊資源。 這是特別重要的 android 作業系統，因為有了有限數量的 OpenCore 實例播放媒體。 應用程式應當調用 `release` 函數的任何 `Media` 不再需要的資源。

    media.release();
    

### 快速的示例

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

在音訊檔中設置的當前的位置。

    media.seekTo(milliseconds);
    

### 參數

*   **毫秒為單位）**： 要以毫秒為單位設置中，音訊的播放位置的位置。

### 快速的示例

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### 黑莓 10 怪癖

*   黑莓 OS 5 設備上不支援。

## media.setVolume

設置音訊檔的音量。

    media.setVolume(volume) ；
    

### 參數

*   **體積**： 要為播放設置的卷。值必須在 0.0 到 1.0 的範圍內。

### 支援的平臺

*   Android 系統
*   iOS

### 快速的示例

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

開始錄製的音訊檔。

    media.startRecord() ；
    

### 支援的平臺

*   Android 系統
*   iOS
*   Windows Phone 7 和 8
*   Windows 8

### 快速的示例

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
    

### Android 的怪癖

*   Android 設備音訊格式記錄的自我調整多速率。指定的檔應以*.amr*副檔名結尾。

### iOS 的怪癖

*   iOS 只記錄到檔的類型*.wav*和返回一個錯誤如果檔副檔名不正確。

*   如果未提供的完整路徑，錄音放在應用程式的 `documents/tmp` 目錄。 這可以通過訪問 `File` API 使用 `LocalFileSystem.TEMPORARY` 。 在記錄時指定的任何子目錄中必須已經存在。

*   檔可以記錄和演奏的後面使用的檔的 URI：
    
        var myMedia = new Media("documents://beer.mp3")
        

### Windows 8 的怪癖

*   如果沒有提供完整的路徑，錄音被放在應用程式/temp 目錄。這可以通過訪問 `檔` API 使用 `LocalFileSystem.TEMPORARY` 或 ' ms appdata： temp / / /<filename>' URI。

*   在記錄時指定的任何子目錄中必須已經存在。

### 泰怪癖

*   不支援在 Tizen 設備上。

## media.stop

停止播放音訊檔。

    media.stop() ；
    

### 簡單的例子

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

停止錄製音訊檔。

    media.stopRecord() ；
    

### 支援的平臺

*   安卓系統
*   iOS
*   Windows Phone 7 和 8
*   Windows 8

### 簡單的例子

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
    

### 泰怪癖

*   不支援在 Tizen 設備上。

## MediaError

A `MediaError` 物件返回到 `mediaError` 時出現錯誤的回呼函數。

### 屬性

*   **代碼**： 下面列出的預定義的錯誤代碼之一。

*   **消息**： 錯誤訊息，描述該錯誤的詳細資訊。

### 常量

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4