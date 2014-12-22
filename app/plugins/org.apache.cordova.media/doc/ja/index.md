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

このプラグインは、記録し、デバイス上のオーディオ ファイルを再生する機能を提供します。

**注**: 現在の実装では、メディアのキャプチャのための W3C 仕様に準拠していないとは便宜上提供されるだけです。 将来の実装を最新の W3C 仕様に準拠し、現在 Api をとがめることがあります。

## インストール

    cordova plugin add org.apache.cordova.media
    

## サポートされているプラットフォーム

*   アンドロイド
*   ブラックベリー 10
*   iOS
*   Windows Phone 7 と 8
*   Tizen
*   Windows 8

## Windows Phone の癖

*   のみ 1 つのメディア ファイルは、一度に再生できます。

*   アプリケーションと他のメディアとの対話に厳格な制限があります。 [詳細については、Microsoft のマニュアル][1]を参照してください。.

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## メディア

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### パラメーター

*   **src**: オーディオのコンテンツを含む URI。*（，）*

*   **mediaSuccess**: (省略可能) 後に実行するコールバックを `Media` 再生用に現在、レコード、または stop アクション オブジェクトが完了しました。*(機能)*

*   **mediaError**: (省略可能) エラーが発生した場合に実行されるコールバック。*(機能)*

*   **mediaStatus**: (省略可能) 状態の変化を示すために実行されるコールバック。*(機能)*

### 定数

次の定数を唯一のパラメーターとして報告されます、 `mediaStatus` コールバック。

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### メソッド

*   `media.getCurrentPosition`: オーディオ ファイル内の現在位置を返します。

*   `media.getDuration`: オーディオ ファイルの継続時間を返します。

*   `media.play`: 開始またはオーディオ ファイルの再生を再開します。

*   `media.pause`： オーディオ ファイルの再生を一時停止。

*   `media.release`: 基になるオペレーティング システムのオーディオ リソースを解放します。

*   `media.seekTo`: オーディオ ファイル内の位置を移動します。

*   `media.setVolume`: オーディオの再生ボリュームを設定します。

*   `media.startRecord`： オーディオ ファイルの録音を開始します。

*   `media.stopRecord`: オーディオ ファイルの録音を停止します。

*   `media.stop`: オーディオ ファイルの再生を停止します。

### 追加読み取り専用パラメーター

*   **位置**： 数秒でオーディオの再生では、内の位置。
    
    *   自動的に更新されません; のプレイ中にコール `getCurrentPosition` を更新します。

*   **期間**: 秒で、メディアの期間。

## media.getCurrentPosition

オーディオ ファイル内の現在位置を返します。また更新して、 `Media` オブジェクトの `position` パラメーター。

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### パラメーター

*   **mediaSuccess**: 秒の現在の位置を渡されるコールバック。

*   **mediaError**: (省略可能) コールバックでエラーが発生した場合に実行します。

### 簡単な例

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

オーディオ ファイルの継続時間 (秒単位) を返します。期間は知られている、-1 の値が返されます。

    media.getDuration();
    

### 簡単な例

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

オーディオ ファイルの再生を一時停止します。

    media.pause();
    

### 簡単な例

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

開始またはオーディオ ファイルの再生を再開します。

    media.play();
    

### 簡単な例

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
    

### iOS の癖

*   **numberOfLoops**: このオプションを指定して、 `play` メディア ファイルを再生する、例えば回数を指定する方法。
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**: このオプションを渡す、 `play` 、画面がロックされているときに再生を許可するかどうかを指定するメソッド。 場合に設定されている `true` (既定値)、例えば、ハードウェア ミュート ボタンの状態は無視されます。
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **ファイル検索の順序**: iOS の検索でファイル名または単純なパスのみが提供される場合、 `www` ディレクトリ、ファイルをアプリケーションの `documents/tmp` ディレクトリ。
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

基になるオペレーティング システムのオーディオ リソースを解放します。 メディアの再生のための OpenCore インスタンスの有限な量があるので、人造人間のため特に重要です。 アプリケーションを呼び出す必要があります、 `release` 任意の関数 `Media` は、もはや必要なリソースです。

    media.release();
    

### 簡単な例

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

オーディオ ファイル内の現在位置を設定します。

    media.seekTo(milliseconds);
    

### パラメーター

*   **ミリ秒単位**： ミリ秒単位で、オーディオの再生位置を設定する位置。

### 簡単な例

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### ブラックベリー 10 癖

*   ブラックベリー OS 5 デバイスでサポートされていません。

## media.setVolume

オーディオ ファイルの音量を設定します。

    media.setVolume(volume);
    

### パラメーター

*   **ボリューム**: ボリュームの再生を設定します。値は 0.0 ～ 1.0 の範囲内である必要があります。

### サポートされているプラットフォーム

*   アンドロイド
*   iOS

### 簡単な例

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

オーディオ ファイルの録音を開始します。

    media.startRecord();
    

### サポートされているプラットフォーム

*   アンドロイド
*   iOS
*   Windows Phone 7 と 8
*   Windows 8

### 簡単な例

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
    

### Android の癖

*   Android 端末適応型マルチレート形式にオーディオを録音します。指定したファイルは、 *.amr*拡張子で終わる必要があります。

### iOS の癖

*   iOS の種類*.wav*と返しますエラー場合は、ファイル名拡張子がファイルをレコードのみが修正されません。

*   記録は、アプリケーションの配置の完全なパスを指定しない場合 `documents/tmp` ディレクトリ。 これを介してアクセスすることができます、 `File` API を使用して `LocalFileSystem.TEMPORARY` 。 記録時に指定された任意のサブディレクトリに存在する必要があります。

*   ファイルを記録し、再生することができますドキュメント URI を使用して。
    
        var myMedia = new Media("documents://beer.mp3")
        

### Windows 8 の癖

*   完全なパスを指定しない場合、記録は AppData/temp ディレクトリに配置されます。これを介してアクセスすることができます、 `ファイル` API を使用してください。 `LocalFileSystem.TEMPORARY` または ' ms appdata: temp////<filename>' URI。

*   記録時に指定された任意のサブディレクトリに存在する必要があります。

### Tizen の癖

*   Tizen のデバイスでサポートされていません。

## media.stop

オーディオ ファイルの再生を停止します。

    media.stop();
    

### 簡単な例

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

オーディオ ファイルの録音を停止します。

    media.stopRecord();
    

### サポートされているプラットフォーム

*   アンドロイド
*   iOS
*   Windows Phone 7 と 8
*   Windows 8

### 簡単な例

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
    

### Tizen の癖

*   Tizen のデバイスでサポートされていません。

## MediaError

A `MediaError` オブジェクトに返される、 `mediaError` コールバック関数でエラーが発生したとき。

### プロパティ

*   **コード**: 次のいずれかの定義済みのエラー コード。

*   **メッセージ**: エラーの詳細を説明するエラー メッセージ。

### 定数

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4