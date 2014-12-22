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

Dieses Plugin bietet die Möglichkeit zum Aufzeichnen und Wiedergeben von audio-Dateien auf einem Gerät.

**Hinweis**: die aktuelle Implementierung eine W3C-Spezifikation für Medien-Capture nicht einhalten, und wird nur zu Informationszwecken zur Verfügung gestellt. Zukünftiger Implementierungen wird an der aktuellen W3C-Spezifikation und kann die aktuellen APIs entweiht.

## Installation

    cordova plugin add org.apache.cordova.media
    

## Unterstützte Plattformen

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 und 8
*   Tizen
*   Windows 8

## Windows Phone Macken

*   Nur eine Mediendatei kann gleichzeitig abgespielt werden.

*   Es gibt strenge Beschränkungen, wie Ihre Anwendung mit anderen Medien interagiert. Finden Sie in der [Microsoft-Dokumentation für details][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Medien

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Parameter

*   **Src**: ein URI mit der audio-Inhalte. *(DOM-String und enthält)*

*   **MediaSuccess**: (Optional) der Rückruf, der nach dem führt ein `Media` -Objekt abgeschlossen hat, die aktuelle Wiedergabe, Aufzeichnung oder Stop-Action. *(Funktion)*

*   **Medienfehler**: (Optional) der Rückruf, der ausgeführt wird, wenn ein Fehler auftritt. *(Funktion)*

*   **MediaStatus**: (Optional) der Rückruf, der ausgeführt wird, um Statusänderungen anzugeben. *(Funktion)*

### Konstanten

Die folgenden Konstanten werden gemeldet, als einzigem Parameter an die `mediaStatus` Rückruf:

*   `Media.MEDIA_NONE`= 0;
*   `Media.MEDIA_STARTING`= 1;
*   `Media.MEDIA_RUNNING`= 2;
*   `Media.MEDIA_PAUSED`= 3;
*   `Media.MEDIA_STOPPED`= 4;

### Methoden

*   `media.getCurrentPosition`: Gibt die aktuelle Position in einer Audiodatei.

*   `media.getDuration`: Gibt die Dauer einer Audiodatei.

*   `media.play`: Starten Sie oder fortsetzen Sie der Wiedergabe einer Audiodatei.

*   `media.pause`: Anhalten der Wiedergabe einer Audiodatei.

*   `media.release`: Das zugrunde liegende Betriebssystem audio Ressourcen frei.

*   `media.seekTo`: Verschiebt die Position innerhalb der audio-Datei.

*   `media.setVolume`: Stellen Sie die Lautstärke für die Audiowiedergabe.

*   `media.startRecord`: Starten der Aufnahme einer audio-Datei.

*   `media.stopRecord`: Stoppen Sie die Aufnahme einer audio-Datei.

*   `media.stop`: Abspielen einer Audiodatei zu stoppen.

### Zusätzliche ReadOnly-Parameter

*   **Position**: die Position innerhalb der audio-Wiedergabe in Sekunden.
    
    *   Nicht während des Spiels automatisch aktualisiert; Rufen Sie `getCurrentPosition` zu aktualisieren.

*   **Dauer**: die Dauer der Medien, in Sekunden.

## media.getCurrentPosition

Gibt die aktuelle Position in einer Audiodatei. Aktualisiert auch die `Media` des Objekts `position` Parameter.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Parameter

*   **MediaSuccess**: der Rückruf, der die aktuelle Position in Sekunden übergeben wird.

*   **Medienfehler**: (Optional) der Rückruf ausgeführt, wenn ein Fehler auftritt.

### Kurzes Beispiel

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

Gibt die Dauer einer Audiodatei in Sekunden. Wenn die Dauer unbekannt ist, wird der Wert-1 zurückgegeben.

    media.getDuration();
    

### Kurzes Beispiel

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

Pausen Abspielen einer Audiodatei.

    media.pause();
    

### Kurzes Beispiel

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

Startet oder setzt fort, Abspielen einer Audiodatei.

    media.play();
    

### Kurzes Beispiel

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
    

### iOS Macken

*   **NumberOfLoops**: übergeben Sie diese Option, um die `play` -Methode können Sie die Anzahl der angeben soll die Mediendatei ausspielen, z.B.:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **PlayAudioWhenScreenIsLocked**: übergeben Sie diese Option, um die `play` -Methode können Sie angeben, ob Sie möchten Wiedergabe zu ermöglichen, wenn der Bildschirm gesperrt ist. Wenn legen Sie auf `true` (der Standardwert), der Zustand der die mute Taste wird ignoriert, z.B.:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **Reihenfolge der Dateisuche**: Wenn nur ein Dateiname oder Pfad angegeben wird, sucht iOS in das `www` Verzeichnis für die Datei, dann in der Anwendung `documents/tmp` Verzeichnis:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

Das zugrunde liegende Betriebssystem audio Ressourcen frei. Dies ist besonders wichtig für Android, da gibt es eine begrenzte Anzahl von OpenCore-Instanzen für die Medienwiedergabe. Anwendungen rufen die `release` -Funktion für alle `Media` Ressource, die nicht mehr benötigt wird.

    media.release();
    

### Kurzes Beispiel

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Legt die aktuelle Position in einer Audiodatei.

    media.seekTo(milliseconds);
    

### Parameter

*   **Millisekunden**: die Position die Wiedergabeposition innerhalb des Audiotracks in Millisekunden festgelegt.

### Kurzes Beispiel

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### BlackBerry 10 Macken

*   BlackBerry OS 5-Geräten unterstützt nicht.

## media.setVolume

Stellen Sie die Lautstärke für eine audio-Datei.

    media.setVolume(volume);
    

### Parameter

*   **Lautstärke**: die Lautstärke für Wiedergabe fest. Der Wert muss im Bereich zwischen 0,0 und 1,0 liegen.

### Unterstützte Plattformen

*   Android
*   iOS

### Kurzes Beispiel

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

Beginnt mit der Aufnahme einer audio-Datei.

    media.startRecord();
    

### Unterstützte Plattformen

*   Android
*   iOS
*   Windows Phone 7 und 8
*   Windows 8

### Kurzes Beispiel

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
    

### Android Eigenarten

*   Android-Geräte aufnehmen Audio im Adaptive Sprachcodecs Format. Die angegebene Datei sollte mit einer Endung *.amr* enden.

### iOS Macken

*   iOS nur Datensätze, die Dateien des Typs *WAV* und gibt ein Fehler, wenn die Dateinamen-Erweiterung ist richtig nicht.

*   Wenn ein vollständiger Pfad nicht angegeben ist, wird die Aufzeichnung in der Anwendung platziert `documents/tmp` Verzeichnis. Erreichbar über die `File` -API verwenden `LocalFileSystem.TEMPORARY` . Allen Unterverzeichnissen in Rekordzeit angegeben muss bereits vorhanden sein.

*   Dateien können aufgezeichnet und spielte mit die Dokumenten URI zurück:
    
        var myMedia = new Media("documents://beer.mp3")
        

### Windows 8 Macken

*   Wenn Sie ein vollständiger Pfad nicht angegeben ist, wird die Aufnahme im AppData/Temp-Verzeichnis platziert. Erreichbar über die `Datei` API verwenden `LocalFileSystem.TEMPORARY` oder "ms-Appdata: / / / Temp /<filename>' URI.

*   Allen Unterverzeichnissen in Rekordzeit angegeben muss bereits vorhanden sein.

### Tizen Macken

*   Tizen Geräten unterstützt nicht.

## media.stop

Beendet die Wiedergabe einer Audiodatei.

    Media.Stop();
    

### Kurzes Beispiel

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

Stoppt die Aufnahme einer audio-Datei.

    media.stopRecord();
    

### Unterstützte Plattformen

*   Android
*   iOS
*   Windows Phone 7 und 8
*   Windows 8

### Kurzes Beispiel

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
    

### Tizen Macken

*   Tizen Geräten unterstützt nicht.

## Medienfehler

A `MediaError` Objekt wird zurückgegeben, um die `mediaError` Callback-Funktion, wenn ein Fehler auftritt.

### Eigenschaften

*   **Code**: einer der vordefinierten Fehlercodes aufgeführt.

*   **Nachricht**: eine Fehlermeldung beschreibt die Details des Fehlers.

### Konstanten

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4