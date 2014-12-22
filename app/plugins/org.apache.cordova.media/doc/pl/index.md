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

Plugin daje możliwość nagrywania i odtwarzania plików audio na urządzeniu.

**Uwaga**: Obecna implementacja nie stosować się do specyfikacji W3C do przechwytywania mediów i jest dostarczane jedynie dla wygody. Przyszłej realizacji będą przylegać do najnowszych specyfikacji W3C i może potępiać bieżące interfejsów API.

## Instalacja

    cordova plugin add org.apache.cordova.media
    

## Obsługiwane platformy

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 i 8
*   Tizen
*   Windows 8

## Windows Phone dziwactwa

*   Tylko jeden plik mogą być zagrany w tył w czasie.

*   Istnieją ścisłe ograniczenia na jak aplikacja współdziała z innymi mediami. Zobacz [Microsoft dokumentacji szczegóły][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Media

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Parametry

*   **src**: URI zawierający zawartość audio. *(DOMString)*

*   **mediaSuccess**: (opcjonalne) wywołania zwrotnego, który wykonuje po `Media` obiektu została zakończona bieżącej gry, rekordu lub działania stop. *(Funkcja)*

*   **mediaError**: (opcjonalne) wywołania zwrotnego, która wykonuje w przypadku wystąpienia błędu. *(Funkcja)*

*   **mediaStatus**: (opcjonalne) wywołania zwrotnego, który wykonuje wskazać zmiany statusu. *(Funkcja)*

### Stałe

Poniższe stałe są zgłaszane jako parametr tylko do `mediaStatus` wywołania zwrotnego:

*   `Media.MEDIA_NONE`= 0;
*   `Media.MEDIA_STARTING`= 1;
*   `Media.MEDIA_RUNNING`= 2;
*   `Media.MEDIA_PAUSED`= 3;
*   `Media.MEDIA_STOPPED`= 4;

### Metody

*   `media.getCurrentPosition`: Zwraca bieżącej pozycji w pliku audio.

*   `media.getDuration`: Zwraca czas trwania pliku audio.

*   `media.play`: Rozpoczęcie lub wznowienie odtwarzania pliku audio.

*   `media.pause`: Wstrzymanie odtwarzania pliku audio.

*   `media.release`: Zwalnia zasoby audio system operacyjny.

*   `media.seekTo`: Porusza się pozycji w pliku audio.

*   `media.setVolume`: Ustaw głośność odtwarzania dźwięku.

*   `media.startRecord`: Nagrywanie pliku audio.

*   `media.stopRecord`: Zatrzymaj nagrywanie pliku audio.

*   `media.stop`: Zatrzymania odtwarzania pliku audio.

### Parametry dodatkowe ReadOnly

*   **stanowisko**: stanowisko w odtwarzaniu dźwięku, w kilka sekund.
    
    *   Nie jest automatycznie aktualizowana podczas odtwarzania; wywołanie `getCurrentPosition` aktualizacji.

*   **czas**: trwania mediów, w kilka sekund.

## media.getCurrentPosition

Zwraca bieżącą pozycję w pliku audio. Również aktualizacje `Media` obiektu `position` parametr.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Parametry

*   **mediaSuccess**: wywołania zwrotnego, który jest przekazywany bieżącej pozycji w kilka sekund.

*   **mediaError**: (opcjonalne) wywołanie zwrotne do wykonać, jeśli wystąpi błąd.

### Szybki przykład

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

Zwraca czas trwania pliku audio w kilka sekund. Jeśli czas trwania jest nieznane, to zwraca wartość -1.

    media.getDuration();
    

### Szybki przykład

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

Wstrzymuje odtwarzanie pliku audio.

    media.pause();
    

### Szybki przykład

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
    

## Media.play

Rozpoczyna się lub wznawia odtwarzanie pliku audio.

    media.play();
    

### Szybki przykład

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
    

### Dziwactwa iOS

*   **numberOfLoops**: przekazać tę opcję, aby `play` Metoda, aby określić ile razy chcesz, pliku multimedialnego do gry, np.:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**: przekazać tę opcję, aby `play` Metoda, aby określić, czy chcesz umożliwić odtwarzanie, gdy ekran jest zablokowana. Jeśli zestaw `true` (wartość domyślna), stan przycisku Wycisz sprzętu jest ignorowane, np.:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **kolejność wyszukiwania plików**: gdy tylko nazwa pliku lub ścieżka prosta pod warunkiem, iOS wyszukiwania w `www` katalogu, pliku, a następnie w aplikacji `documents/tmp` katalogu:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

Zwalnia zasoby audio system operacyjny. Jest to szczególnie ważne dla systemu Android, ponieważ istnieje skończona ilość podstawie OpenCore wystąpień do odtwarzania multimediów. Aplikacje powinny wywoływać `release` funkcja dla każdego `Media` zasób, który nie jest już potrzebna.

    media.release();
    

### Szybki przykład

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Ustawia bieżącej pozycji w pliku audio.

    media.seekTo(milliseconds);
    

### Parametry

*   **milisekund**: stanowisko ustala pozycję odtwarzania w audio, w milisekundach.

### Szybki przykład

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### Jeżyna 10 dziwactwa

*   Nie obsługiwane na urządzeniach BlackBerry OS w wersji 5.

## media.setVolume

Ustaw głośność pliku audio.

    media.setVolume(volume);
    

### Parametry

*   **wielkość**: wielkość ustawić odtwarzanie. Wartość musi być z zakresu od 0.0 do 1.0.

### Obsługiwane platformy

*   Android
*   iOS

### Szybki przykład

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

Rozpoczyna nagrywanie pliku audio.

    media.startRecord();
    

### Obsługiwane platformy

*   Android
*   iOS
*   Windows Phone 7 i 8
*   Windows 8

### Szybki przykład

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
    

### Dziwactwa Androida

*   Urządzenia z systemem Android nagrywanie dźwięku w formacie Adaptive Multi-Rate. Określony plik powinien kończyć się rozszerzeniem *AMR* .

### Dziwactwa iOS

*   iOS tylko rekordy do plików typu *.wav* i zwraca błąd, jeśli nazwa pliku rozszerzenie jest nie prawidłowe.

*   Jeśli nie podano pełną ścieżkę, nagrywanie jest umieszczony w aplikacji `documents/tmp` katalogu. To mogą być dostępne za pośrednictwem `File` za pomocą interfejsu API `LocalFileSystem.TEMPORARY` . Każdy podkatalog określony w rekordowym czasie musi już istnieć.

*   Pliki mogą być zapisywane i grał z powrotem za pomocą dokumentów URI:
    
        var myMedia = new Media("documents://beer.mp3")
        

### Windows 8 dziwactwa

*   Jeśli nie podano pełną ścieżkę, nagrywanie jest umieszczony w katalogu AppData/temp. To mogą być dostępne za pośrednictwem `Plik` Za pomocą interfejsu API `LocalFileSystem.TEMPORARY` lub "ms-appdata: temp / / / /<filename>"URI.

*   Każdy podkatalog określony w rekordowym czasie musi już istnieć.

### Dziwactwa Tizen

*   Nie obsługiwane na Tizen urządzenia.

## media.stop

Zatrzymuje odtwarzanie pliku audio.

    Media.stop();
    

### Szybki przykład

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

Zatrzymuje nagrywanie pliku audio.

    media.stopRecord();
    

### Obsługiwane platformy

*   Android
*   iOS
*   Windows Phone 7 i 8
*   Windows 8

### Szybki przykład

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
    

### Dziwactwa Tizen

*   Nie obsługiwane na Tizen urządzenia.

## MediaError

A `MediaError` obiekt jest zwracany do `mediaError` funkcji wywołania zwrotnego, gdy wystąpi błąd.

### Właściwości

*   **Kod**: jeden z kodów błędów wstępnie zdefiniowanych poniżej.

*   **wiadomość**: komunikat o błędzie, opisując szczegóły błędu.

### Stałe

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4