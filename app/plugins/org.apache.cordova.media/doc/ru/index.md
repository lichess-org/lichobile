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

Этот плагин предоставляет возможность записывать и воспроизводить аудио файлы на устройство.

**Примечание**: Текущая реализация не соответствует спецификации W3C для захвата СМИ и предоставляется только для удобства. Будущее осуществление будет придерживаться последней спецификации W3C и может Опознайте текущих API.

## Установка

    cordova plugin add org.apache.cordova.media
    

## Поддерживаемые платформы

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 и 8
*   Tizen
*   Windows 8

## Windows Phone причуды

*   Только один файл может воспроизводиться одновременно.

*   Существуют строгие ограничения в отношении как ваше приложение взаимодействует с другими средствами массовой информации. Смотрите в [документации Microsoft для подробной информации][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Аудио и видео

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Параметры

*   **src**: URI, содержащий аудио-контент. *(DOMString)*

*   **mediaSuccess**: (необязательно) обратного вызова, который выполняется после `Media` объект завершения текущего воспроизведения, записи или стоп действий. *(Функция)*

*   **mediaError**: (необязательно) обратного вызова, который выполняется при возникновении ошибки. *(Функция)*

*   **mediaStatus**: (необязательно) обратного вызова, который выполняется для отображения изменений состояния. *(Функция)*

### Константы

Следующие константы сообщается как единственный параметр для `mediaStatus` обратного вызова:

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### Методы

*   `media.getCurrentPosition`: Возвращает текущую позицию в аудиофайл.

*   `media.getDuration`: Возвращает продолжительность звукового файла.

*   `media.play`: Начать или возобновить воспроизведение звукового файла.

*   `media.pause`: Приостановка воспроизведения звукового файла.

*   `media.release`: Выпускает аудио ресурсы базовой операционной системы.

*   `media.seekTo`: Перемещает положение в пределах звукового файла.

*   `media.setVolume`: Задайте громкость воспроизведения звука.

*   `media.startRecord`: Начните запись звукового файла.

*   `media.stopRecord`: Остановите запись аудио файлов.

*   `media.stop`: Остановка воспроизведения звукового файла.

### Дополнительные ReadOnly параметры

*   **позиции**: позиция в аудио воспроизведения в секундах.
    
    *   Не автоматически обновляются во время игры; Вызовите `getCurrentPosition` для обновления.

*   **Продолжительность**: продолжительность СМИ, в секундах.

## media.getCurrentPosition

Возвращает текущую позицию в звуковой файл. Также обновляет `Media` объекта `position` параметр.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Параметры

*   **mediaSuccess**: обратный вызов, который передается в текущую позицию в секундах.

*   **mediaError**: (необязательно) обратного вызова для выполнения, если происходит ошибка.

### Краткий пример

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

Возвращает продолжительность аудио файла в секундах. Если длительность неизвестна, она возвращает значение -1.

    media.getDuration();
    

### Краткий пример

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
    

## Media.Pause

Приостанавливает воспроизведение звукового файла.

    media.pause();
    

### Краткий пример

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
    

## Media.Play

Запускает или возобновляет воспроизведение звукового файла.

    media.play();
    

### Краткий пример

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
    

### Особенности iOS

*   **numberOfLoops**: этот параметр, чтобы передать `play` метод, чтобы указать количество раз, вы хотите, чтобы средства массовой информации файла для воспроизведения, например:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**: передайте этот параметр для `play` метод, чтобы указать, хотите ли вы разрешить воспроизведение, когда экран заблокирован. Если значение `true` (значение по умолчанию), состояние оборудования безгласную кнопку игнорируется, например:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **Порядок поиска файла**: когда предоставляется только имя файла или простой путь, iOS ищет в `www` каталог для файла, а затем в приложении `documents/tmp` каталога:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

Освобождает ресурсы аудио базовой операционной системы. Это особенно важно для Android, так как существует конечное количество экземпляров OpenCore для воспроизведения мультимедиа. Приложения должны вызвать `release` функция для любого `Media` ресурс, который больше не нужен.

    media.release();
    

### Краткий пример

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Задает текущую позицию в течение звукового файла.

    media.seekTo(milliseconds);
    

### Параметры

*   **МС**: позиции задать позицию воспроизведения в аудио, в миллисекундах.

### Краткий пример

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### Особенности BlackBerry 10

*   Не поддерживается на устройствах BlackBerry OS 5.

## media.setVolume

Задайте громкость звукового файла.

    media.setVolume(volume);
    

### Параметры

*   **объем**: тома, чтобы задать для воспроизведения. Значение должно быть в диапазоне от 0.0 до 1.0.

### Поддерживаемые платформы

*   Android
*   iOS

### Краткий пример

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

Начинает запись аудио файлов.

    media.startRecord();
    

### Поддерживаемые платформы

*   Android
*   iOS
*   Windows Phone 7 и 8
*   Windows 8

### Краткий пример

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
    

### Особенности Android

*   Android устройств записи аудио в формате адаптивной мульти ставка. Указанный файл должен заканчиваться *.amr* расширение.

### Особенности iOS

*   iOS только записи в файлы типа *.wav* и возвращает ошибку, если расширение не исправить.

*   Если полный путь не указан, запись помещается в приложения `documents/tmp` каталог. Это могут быть доступны через `File` API с помощью `LocalFileSystem.TEMPORARY` . Любой подкаталог, указанный на время записи должны уже существовать.

*   Файлы могут быть и сыграны записываются обратно, используя документы URI:
    
        var myMedia = new Media("documents://beer.mp3")
        

### Совместимости Windows 8

*   Если не указан полный путь, запись помещается в каталоге AppData/temp. Это могут быть доступны через `Файл` С помощью API `LocalFileSystem.TEMPORARY` или ' ms-appdata: / / / temp /<filename>' URI.

*   Любой подкаталог указанного в рекордное время должна уже существовать.

### Особенности Tizen

*   Не поддерживается на устройствах Tizen.

## media.stop

Останавливает воспроизведение звукового файла.

    media.stop();
    

### Краткий пример

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

Прекращает запись аудио файлов.

    media.stopRecord();
    

### Поддерживаемые платформы

*   Android
*   iOS
*   Windows Phone 7 и 8
*   Windows 8

### Краткий пример

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
    

### Особенности Tizen

*   Не поддерживается на устройствах Tizen.

## MediaError

A `MediaError` объект возвращается к `mediaError` функции обратного вызова при возникновении ошибки.

### Параметры

*   **code**: один из стандартных кодов ошибок, перечисленных ниже.

*   **сообщение**: сообщение об ошибке, с подробными сведениями об ошибке.

### Константы

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4