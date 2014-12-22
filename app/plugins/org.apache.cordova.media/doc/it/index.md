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

Questo plugin consente di registrare e riprodurre i file audio su un dispositivo.

**Nota**: l'implementazione attuale non aderisce a una specifica del W3C per l'acquisizione di mezzi e viene fornito solo per comodità. Una futura realizzazione aderirà alla specifica W3C più recente e può deprecare le API corrente.

## Installazione

    cordova plugin add org.apache.cordova.media
    

## Piattaforme supportate

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 e 8
*   Tizen
*   Windows 8

## Stranezze di Windows Phone

*   File sola multimediale può essere riprodotti in un momento.

*   Ci sono severe restrizioni su come l'applicazione interagisce con altri media. Vedere la [documentazione di Microsoft per maggiori dettagli][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Media

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Parametri

*   **src**: un URI contenente il contenuto audio. *(DOMString)*

*   **mediaSuccess**: (facoltativo) il callback che viene eseguito dopo un `Media` oggetto ha completato il gioco corrente, record o interrompere l'azione. *(Funzione)*

*   **errore mediaError**: (facoltativo) il callback che viene eseguito se si verifica un errore. *(Funzione)*

*   **mediaStatus**: (facoltativo) il callback che viene eseguito per indicare i cambiamenti di stato. *(Funzione)*

### Costanti

Costanti sono segnalate come unico parametro per il `mediaStatus` callback:

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### Metodi

*   `media.getCurrentPosition`: Restituisce la posizione corrente all'interno di un file audio.

*   `media.getDuration`: Restituisce la durata di un file audio.

*   `media.play`: Iniziare o riprendere la riproduzione di un file audio.

*   `media.pause`: Pausa la riproduzione di un file audio.

*   `media.release`: Libera risorse audio del sistema operativo sottostante.

*   `media.seekTo`: Sposta la posizione all'interno del file audio.

*   `media.setVolume`: Impostare il volume per la riproduzione audio.

*   `media.startRecord`: Iniziare a registrare un file audio.

*   `media.stopRecord`: Interrompere la registrazione di un file audio.

*   `media.stop`: Interrompere la riproduzione di un file audio.

### Parametri supplementari ReadOnly

*   **posizione**: la posizione all'interno della riproduzione audio, in pochi secondi.
    
    *   Non aggiornate automaticamente durante il gioco; chiamare `getCurrentPosition` per l'aggiornamento.

*   **durata**: la durata dei media, in secondi.

## media.getCurrentPosition

Restituisce la posizione corrente all'interno di un file audio. Aggiorna anche il `Media` dell'oggetto `position` parametro.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Parametri

*   **mediaSuccess**: il callback passato la posizione corrente in pochi secondi.

*   **errore mediaError**: (facoltativo) il callback da eseguire se si verifica un errore.

### Esempio rapido

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

Restituisce la durata di un file audio in secondi. Se la durata è sconosciuta, essa restituisce un valore di -1.

    media.getDuration();
    

### Esempio rapido

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
    

## Media.pause

Sospende la riproduzione di un file audio.

    media.pause();
    

### Esempio rapido

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

Avvia o riprende la riproduzione di un file audio.

    media.play();
    

### Esempio rapido

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
    

### iOS stranezze

*   **numberOfLoops**: passare questa opzione per il `play` metodo per specificare il numero di volte desiderato file multimediale per riprodurre, ad esempio:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**: questa opzione per passare il `play` metodo per specificare se si desidera consentire la riproduzione quando lo schermo è bloccato. Se impostato su `true` (il valore predefinito), viene ignorato lo stato del pulsante mute hardware, ad esempio:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **ordine di ricerca di file**: quando viene fornito solo un nome file o percorso semplice, cerca in iOS il `www` directory per il file, quindi l'applicazione `documents/tmp` directory:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

Rilascia le risorse audio del sistema operativo sottostante. Ciò è particolarmente importante per Android, dato che ci sono una quantità finita di OpenCore istanze per la riproduzione multimediale. Le applicazioni devono chiamare il `release` funzione per qualsiasi `Media` risorsa che non è più necessario.

    media.release();
    

### Esempio rapido

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Imposta la posizione corrente all'interno di un file audio.

    media.seekTo(milliseconds);
    

### Parametri

*   **millisecondi**: posizione per impostare la posizione di riproduzione all'interno l'audio, in millisecondi.

### Esempio rapido

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### BlackBerry 10 capricci

*   Non è supportato sui dispositivi BlackBerry OS 5.

## media.setVolume

Impostare il volume per un file audio.

    media.setVolume(volume);
    

### Parametri

*   **volume**: il volume impostato per la riproduzione. Il valore deve essere all'interno della gamma di 0,0 e 1,0.

### Piattaforme supportate

*   Android
*   iOS

### Esempio rapido

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

Avvia la registrazione di un file audio.

    media.startRecord();
    

### Piattaforme supportate

*   Android
*   iOS
*   Windows Phone 7 e 8
*   Windows 8

### Esempio rapido

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
    

### Stranezze Android

*   Dispositivi Android registrano audio in formato Adaptive Multi-Rate. Il file specificato deve terminare con l'estensione ** .

### iOS stranezze

*   iOS solo i record per i file di tipo *WAV* e restituisce un errore se il file di nome estensione è non corretto.

*   Se non è specificato un percorso completo, la registrazione viene inserita nell'applicazione `documents/tmp` directory. Questo si può accedere tramite il `File` API utilizzando `LocalFileSystem.TEMPORARY` . Deve esistere alcuna sottodirectory specificate a tempo di record.

*   I file possono essere registrati e giocati indietro usando i documenti URI:
    
        var myMedia = new Media("documents://beer.mp3")
        

### Stranezze di Windows 8

*   Se non è specificato un percorso completo, la registrazione viene inserita nella directory AppData/temp. Questo si può accedere tramite il `File` Utilizzando API `LocalFileSystem.TEMPORARY` o ' ms-appdata: / / temp /<filename>' URI.

*   Deve esistere alcuna sottodirectory specificate a tempo di record.

### Tizen stranezze

*   Tizen periferiche non supportano.

## media.stop

Interrompe la riproduzione di un file audio.

    Media.Stop();
    

### Esempio rapido

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

Smette di registrare un file audio.

    media.stopRecord();
    

### Piattaforme supportate

*   Android
*   iOS
*   Windows Phone 7 e 8
*   Windows 8

### Esempio rapido

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
    

### Tizen stranezze

*   Tizen periferiche non supportano.

## Errore MediaError

A `MediaError` oggetto viene restituito alla `mediaError` funzione di callback quando si verifica un errore.

### Proprietà

*   **codice**: uno dei codici di errore predefiniti elencati di seguito.

*   **messaggio**: un messaggio di errore che descrive i dettagli dell'errore.

### Costanti

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4