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

Este plugin proporciona la capacidad de grabar y reproducir archivos de audio en un dispositivo.

**Nota**: la implementación actual no se adhiere a una especificación del W3C para la captura de los medios de comunicación y se proporciona únicamente para su comodidad. Una futura implementación se adherirá a la última especificación W3C y puede desaprueban las API actuales.

## Instalación

    cordova plugin add org.apache.cordova.media
    

## Plataformas soportadas

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 y 8
*   Tizen
*   Windows 8

## Windows Phone rarezas

*   Archivo sólo multimedia puede reproducir en un momento.

*   Hay restricciones estrictas sobre cómo interactúa la aplicación con otros medios. Consulte la [documentación de Microsoft para obtener más detalles][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Los medios de comunicación

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Parámetros

*   **fuente**: un URI que contiene el contenido de audio. *(DOMString)*

*   **mediaSuccess**: (opcional) la devolución de llamada que se ejecuta después de un `Media` objeto ha completado el juego actual, registro o acción. *(Función)*

*   **mediaError**: (opcional) la devolución de llamada que se ejecuta si se produce un error. *(Función)*

*   **mediaStatus**: (opcional) la devolución de llamada que se ejecuta para indicar cambios en el estado. *(Función)*

### Constantes

Las siguientes constantes se presentan como el único parámetro a la `mediaStatus` "callback":

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### Métodos

*   `media.getCurrentPosition`: Devuelve la posición actual dentro de un archivo de audio.

*   `media.getDuration`: Devuelve la duración de un archivo de audio.

*   `media.play`: Iniciar o reanudar la reproducción de un archivo de audio.

*   `media.pause`: Pausar la reproducción de un archivo de audio.

*   `media.release`: Libera recursos de audio del sistema operativo subyacente.

*   `media.seekTo`: Mueve la posición dentro del archivo de audio.

*   `media.setVolume`: Ajusta el volumen de reproducción de audio.

*   `media.startRecord`: Iniciar la grabación de un archivo de audio.

*   `media.stopRecord`: Dejar de grabar un archivo de audio.

*   `media.stop`: Deja de jugar un archivo de audio.

### Parámetros adicionales de sólo lectura

*   **posición**: la posición dentro de la reproducción de audio, en segundos.
    
    *   No actualizada automáticamente durante la reproducción; llame al `getCurrentPosition` para actualizar.

*   **duración**: la duración de los medios de comunicación, en segundos.

## media.getCurrentPosition

Devuelve la posición actual dentro de un archivo de audio. También actualiza el `Media` del objeto `position` parámetro.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Parámetros

*   **mediaSuccess**: la devolución de llamada que se pasa a la posición actual en segundos.

*   **mediaError**: (opcional) la devolución de llamada que se ejecutarán si se produce un error.

### Ejemplo rápido

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

Devuelve la duración de un archivo de audio en segundos. Si se desconoce la duración, devuelve un valor de -1.

    media.getDuration();
    

### Ejemplo rápido

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

Detiene temporalmente la reproducción de un archivo de audio.

    media.pause();
    

### Ejemplo rápido

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

Inicia o reanuda la reproducción de un archivo de audio.

    media.play();
    

### Ejemplo rápido

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
    

### iOS rarezas

*   **numberOfLoops**: esta opción para pasar la `play` método para especificar el número de veces que usted quiere presentar los medios de comunicación para jugar, por ejemplo:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked**: pasar en esta opción para el `play` método para especificar si desea permitir la reproducción cuando la pantalla está bloqueada. Si a `true` (el valor predeterminado), se ignora el estado del botón mute hardware, por ejemplo:
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **orden de búsqueda de archivos**: cuando se proporciona sólo un nombre de archivo o ruta simple, iOS busca en el `www` Directorio para el archivo, luego en de la aplicación `documents/tmp` Directorio:
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // first looks for file in www/audio/beer.mp3 then in <application>/documents/tmp/audio/beer.mp3
        

## media.release

Libera los recursos de audio del sistema operativo subyacente. Esto es particularmente importante para Android, ya que hay una cantidad finita de instancias de OpenCore para la reproducción multimedia. Las aplicaciones deben llamar el `release` función para cualquier `Media` recurso que ya no es necesario.

    media.release();
    

### Ejemplo rápido

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Establece la posición actual dentro de un archivo de audio.

    media.seekTo(milliseconds);
    

### Parámetros

*   **milisegundos**: la posición para ajustar la posición de reproducción en el audio, en milisegundos.

### Ejemplo rápido

    // Audio player
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // SeekTo to 10 seconds after 5 seconds
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### BlackBerry 10 rarezas

*   No compatible con dispositivos BlackBerry OS 5.

## media.setVolume

Ajuste el volumen para un archivo de audio.

    media.setVolume(volume);
    

### Parámetros

*   **volumen**: el volumen para la reproducción. El valor debe estar dentro del rango de 0.0 a 1.0.

### Plataformas soportadas

*   Android
*   iOS

### Ejemplo rápido

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

Empieza a grabar un archivo de audio.

    media.startRecord();
    

### Plataformas soportadas

*   Android
*   iOS
*   Windows Phone 7 y 8
*   Windows 8

### Ejemplo rápido

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
    

### Rarezas Android

*   Dispositivos Android grabación audio en formato Adaptive Multi-Rate. El archivo especificado debe terminar con una extensión de *AMR* .

### iOS rarezas

*   iOS sólo registros a archivos de tipo *.wav* y devuelve un error si el nombre del archivo extensión es no es correcto.

*   Si no se proporciona una ruta completa, la grabación se coloca en la aplicación `documents/tmp` Directorio. Esto puede accederse a través de la `File` API utilizando `LocalFileSystem.TEMPORARY` . Ya debe existir ningún subdirectorio especificado en un tiempo récord.

*   Archivos pueden ser grabados y jugó de nuevo usando los documentos URI:
    
        var myMedia = new Media("documents://beer.mp3")
        

### Rarezas Tizen

*   No compatible con dispositivos Tizen.

## media.stop

Deja de reproducir un archivo de audio.

    media.stop();
    

### Ejemplo rápido

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

Detiene la grabación de un archivo de audio.

    media.stopRecord();
    

### Plataformas soportadas

*   Android
*   iOS
*   Windows Phone 7 y 8
*   Windows 8

### Ejemplo rápido

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
    

### Rarezas Tizen

*   No compatible con dispositivos Tizen.

## MediaError

A `MediaError` objeto es devuelto a la `mediaError` función de devolución de llamada cuando se produce un error.

### Propiedades

*   **código**: uno de los códigos de error predefinido enumerados a continuación.

*   **mensaje**: un mensaje de error que describe los detalles del error.

### Constantes

*   `MediaError.MEDIA_ERR_ABORTED`
*   `MediaError.MEDIA_ERR_NETWORK`
*   `MediaError.MEDIA_ERR_DECODE`
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`