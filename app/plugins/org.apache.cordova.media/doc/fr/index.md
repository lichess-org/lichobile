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

Ce plugin permet d'enregistrer et de lire des fichiers audio sur un périphérique.

**Remarque**: l'implémentation actuelle n'est pas conforme à une spécification du W3C pour la capture de médias et est fournie pour plus de commodité seulement. Une prochaine implémentation adhèrera à la toute dernière spécification du W3C, ce qui aura probablement pour effet de déprécier l'API actuelle.

## Installation

    cordova plugin add org.apache.cordova.media
    

## Plates-formes prises en charge

*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 et 8
*   Paciarelli
*   Windows 8

## Windows Phone Quirks

*   Un seul fichier média peut être lu à la fois.

*   Il y a des restrictions strictes concernant la façon dont votre application interagit avec d'autres médias. Consultez la [documentation de Microsoft pour plus d'informations][1].

 [1]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh184838(v=vs.92).aspx

## Media

    var media = new Media(src, mediaSuccess, [mediaError], [mediaStatus]);
    

### Paramètres

*   **src** : l'URI du contenu audio. *(DOMString)*

*   **mediaSuccess** : (facultative) la fonction callback exécutée après que la lecture en cours, l'action d'enregistrement ou l'arrêt de lecture de l'objet `Media` soit terminée. *(Function)*

*   **mediaError** : (facultative) la fonction callback exécutée si une erreur survient. *(Function)*

*   **mediaStatus** : (facultative) la fonction callback exécutée lors de chaque changement d'état. *(Function)*

### Constantes

Les constantes suivantes correspondent au seul paramètre transmis à la fonction callback `mediaStatus` :

*   `Media.MEDIA_NONE` = 0;
*   `Media.MEDIA_STARTING` = 1;
*   `Media.MEDIA_RUNNING` = 2;
*   `Media.MEDIA_PAUSED` = 3;
*   `Media.MEDIA_STOPPED` = 4;

### Méthodes

*   `media.getCurrentPosition` : retourne la position de lecture dans un fichier audio.

*   `media.getDuration`: retourne la durée d'un fichier audio.

*   `media.play` : permet de commencer ou reprendre la lecture d'un fichier audio.

*   `media.pause` : interrompt la lecture d'un fichier audio.

*   `media.release` : libère les ressources audio correspondantes du système d'exploitation.

*   `media.seekTo` : déplace la position de lecture au sein du fichier audio.

*   `media.setVolume` : permet de régler le volume du clip audio.

*   `media.startRecord` : commence l'enregistrement d'un fichier audio.

*   `media.stopRecord` : arrête l'enregistrement d'un fichier audio.

*   `media.stop` : arrête la lecture d'un fichier audio.

### Paramètres supplémentaires en lecture seule

*   **position** : la position de lecture sein du clip audio, en secondes.
    
    *   La valeur n'est pas automatiquement rafraichie pendant la lecture ; un appel à `getCurrentPosition` permet sa mise à jour.

*   **duration** : la durée du média, en secondes.

## media.getCurrentPosition

Retourne la position courante dans un fichier audio. Met également à jour la `Media` de l'objet `position` paramètre.

    media.getCurrentPosition(mediaSuccess, [mediaError]);
    

### Paramètres

*   **mediaSuccess** : la fonction callback à laquelle est transmise la position actuelle exprimée en secondes.

*   **mediaError** : (facultative) la fonction callback exécutée si une erreur se produit.

### Petit exemple

    // lecteur audio
    //
    var my_media = new Media(src, onSuccess, onError);
    
    // met à jour la position de lecture du fichier à chaque seconde
    var mediaTimer = setInterval(function () {
        // récupère la position
        my_media.getCurrentPosition(
            // fonction callback de succès
            function (position) {
                if (position > -1) {
                    console.log((position) + " secondes");
                }
            },
            // fonction callback d'erreur
            function (e) {
                console.log("Erreur lors de l'obtention de la position : " + e);
            }
        );
    }, 1000);
    

## media.getDuration

Retourne la durée d'un fichier audio en quelques secondes. Si on ne connaît pas la durée, elle retourne la valeur -1.

    media.getDuration();
    

### Petit exemple

    // lecteur audio
    //
    var my_media = new Media(src, onSuccess, onError);
    
    // récupère la durée
    var counter = 0;
    var timerDur = setInterval(function() {
        counter = counter + 100;
        if (counter > 2000) {
            clearInterval(timerDur);
        }
        var dur = my_media.getDuration();
        if (dur > 0) {
            clearInterval(timerDur);
            document.getElementById('audio_duration').innerHTML = (dur) + " secondes";
        }
    }, 100);
    

## media.pause

Suspend la lecture d'un fichier audio.

    media.pause();
    

### Petit exemple

    // joue le clip audio
    //
    function playAudio(url) {
        // joue le fichier audio situé à cette url
        var my_media = new Media(url,
            // fonction callback de succès
            function () { console.log("playAudio() : clip audio joué avec succès"); },
            // error callback
            function (err) { console.log("playAudio() : erreur lors de la lecture du clip audio: " + err); }
        );
    
        // lance la lecture du clip audio
        my_media.play();
    
        // met la lecture en pause après 10 secondes
        setTimeout(function () {
            media.pause();
        }, 10000);
    }
    

## media.play

Commence ou reprend la lecture d'un fichier audio.

    media.play();
    

### Petit exemple

    // joue le clip audio
    //
    function playAudio(url) {
        // joue le fichier audio situé à cette url
        var my_media = new Media(url,
            // fonction callback de succès
            function () {
                console.log("playAudio() : fichier audio lu avec succès");
            },
            // fonction callback d'erreur
            function (err) {
                console.log("playAudio() : erreur lors de la lecture du fichier audio : " + err);
            }
        );
        // commence la lecture du clip audio
        my_media.play();
    }
    

### iOS Quirks

*   **numberOfLoops** : transmettre cette option à la méthode `play` permet de spécifier le nombre de lectures à la suite d'un fichier donné, par exemple :
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ numberOfLoops: 2 })
        

*   **playAudioWhenScreenIsLocked** : transmettre cette option à la méthode `play` permet de spécifier si la lecture doit continuer même lorsque l'écran de l'appareil est verrouillé. Si la valeur est `true` (par défaut), le bouton matériel mute est ignoré, par exemple :
    
        var myMedia = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3")
        myMedia.play({ playAudioWhenScreenIsLocked : false })
        

*   **ordre de recherche de fichier** : si un nom de fichier ou chemin d'accès simple est fourni, iOS recherche d'abord le fichier correspondant dans le répertoire `www`, puis dans le répertoire `documents/tmp` appartenant à l'application :
    
        var myMedia = new Media("audio/beer.mp3")
        myMedia.play()  // recherche d'abord le fichier www/audio/beer.mp3 puis <application>/documents/tmp/audio/beer.mp3
        

## media.release

Libère certaines ressources audio du système d'exploitation. Cela est particulièrement important pour Android, puisqu'il y a une quantité finie d'instances OpenCore pour la lecture du média. Les applications doivent en général appeler cette fonction `release` pour toute ressource `Media` qui n'est plus nécessaire.

    media.release();
    

### Petit exemple

    // lecteur audio
    //
    var my_media = new Media(src, onSuccess, onError);
    
    my_media.play();
    my_media.stop();
    my_media.release();
    

## media.seekTo

Définit la position de lecture actuelle dans un fichier audio.

    media.seekTo(milliseconds);
    

### Paramètres

*   **milliseconds** : la nouvelle position de lecture au sein du fichier audio, en millisecondes.

### Petit exemple

    // lecteur audio
    //
    var my_media = new Media(src, onSuccess, onError);
        my_media.play();
    // avance la position à 10 secondes du début du fichier après 5 secondes
    setTimeout(function() {
        my_media.seekTo(10000);
    }, 5000);
    

### BlackBerry 10 Quirks

*   Cette méthode n'est pas prise en charge sur les périphériques BlackBerry OS 5.

## media.setVolume

Permet de régler le volume d'un fichier audio.

    media.setVolume(volume);
    

### Paramètres

*   **volume** : le volume à utiliser pour la lecture. La valeur doit être comprise entre 0.0 et 1.0 inclus.

### Plates-formes prises en charge

*   Android
*   iOS

### Petit exemple

    // joue le clip audio
    //
    function playAudio(url) {
        // joue le fichier audio situé à cette url
        var my_media = new Media(url,
            // fonction callback de succès
            function() {
                console.log("playAudio() : fichier audio lu avec succès");
            },
            // fonction callback d'erreur
            function(err) {
                console.log("playAudio() : erreur lors de la lecture du fichier audio : " + err);
        });
    
        // lance la lecture du clip audio
        my_media.play();
    
        // baisse le volume au maximum après 2 secondes
        setTimeout(function() {
            my_media.setVolume('0.0');
        }, 2000);
    
        // monte le volume à 1.0 (maximum) après 5 secondes
        setTimeout(function() {
            my_media.setVolume('1.0');
        }, 5000);
    }
    

## media.startRecord

Permet de démarrer l'enregistrement d'un fichier audio.

    media.startRecord();
    

### Plates-formes prises en charge

*   Android
*   iOS
*   Windows Phone 7 et 8
*   Windows 8

### Petit exemple

    // enregistrement audio
    //
    function recordAudio() {
        var src = "myrecording.mp3";
        var mediaRec = new Media(src,
            // fonction callback de succès
            function() {
                console.log("recordAudio() : audio enregistré avec succès");
            },
    
            // fonction callback d'erreur
            function(err) {
                console.log("recordAudio() : erreur lors de l'enregistrement audio : " + err.code);
            });
    
        // débute l'enregistrement audio
        mediaRec.startRecord();
    }
    

### Quirks Android

*   Les appareils Android enregistrent de l'audio au format Adaptive Multi-Rate. Le nom de fichier spécifié doit donc comporter une extension *.amr*.

### iOS Quirks

*   iOS produit uniquement des enregistrements sous la forme de fichier de type *.wav* et renvoie une erreur si l'extension du nom de fichier est incorrecte.

*   Si un chemin d'accès complet n'est pas précisé, l'enregistrement est placé dans le répertoire `documents/tmp` correspondant à l'application. Il sera ensuite accessible via l'API `File` en utilisant la constante `LocalFileSystem.TEMPORARY`. Tout sous-répertoire présent dans le chemin d'accès au moment de l'enregistrement doit déjà exister.

*   Les fichiers peuvent être enregistrés et lus à l'aide de l'URI des documents :
    
        var myMedia = new Media("documents://beer.mp3")
        

### Bizarreries de Windows 8

*   Si un chemin d'accès complet n'est pas fourni, l'enregistrement est placé dans le répertoire AppData/temp. Ce qui peut être consulté le `Fichier` À l'aide de l'API `LocalFileSystem.TEMPORARY` ou ' ms-appdata : temp / / / /<filename>' URI.

*   N'importe quel sous-répertoire spécifié au moment de l'enregistrement doit déjà exister.

### Bizarreries de paciarelli

*   Pas pris en charge sur les appareils paciarelli.

## media.stop

Arrête la lecture d'un fichier audio.

    media.stop();
    

### Petit exemple

    // joue le clip audio
    //
    function playAudio(url) {
        // joue le fichier audio situé à cette url
        var my_media = new Media(url,
            // fonction callback de succès
            function() {
                console.log("playAudio() : clip audio lu avec succès");
            },
            // fonction callback d'erreur
            function(err) {
                console.log("playAudio() : erreur lors de la lecture du clip audio : " + err);
            }
        );
    
        // démarre la lecture du clip audio
        my_media.play();
    
        // arrête la lecture après 10 secondes
        setTimeout(function() {
            my_media.stop();
        }, 10000);
    }
    

## media.stopRecord

Arrête l'enregistrement d'un fichier audio.

    media.stopRecord();
    

### Plates-formes prises en charge

*   Android
*   iOS
*   Windows Phone 7 et 8
*   Windows 8

### Petit exemple

    // enregistrement audio
    //
    function recordAudio() {
        var src = "myrecording.mp3";
        var mediaRec = new Media(src,
            // fonction callback de succès
            function() {
                console.log("recordAudio() : audio enregistré avec succès");
            },
    
            // fonction callback d'erreur
            function(err) {
                console.log("recordAudio() : erreur lors de l'enregistrement audio : " + err.code);
            }
        );
    
        // débute l'enregistrement audio
        mediaRec.startRecord();
    
        // arrête l'enregistrement après 10 secondes
        setTimeout(function() {
            mediaRec.stopRecord();
        }, 10000);
    }
    

### Bizarreries de paciarelli

*   Pas pris en charge sur les appareils paciarelli.

## MediaError

Un objet `MediaError` est transmis à la fonction callback `mediaError` lorsqu'une erreur survient.

### Propriétés

*   **code**: l'un des codes d'erreur prédéfinis énumérés ci-dessous.

*   **message**: un message d'erreur décrivant les détails de l'erreur.

### Constantes

*   `MediaError.MEDIA_ERR_ABORTED`= 1
*   `MediaError.MEDIA_ERR_NETWORK`= 2
*   `MediaError.MEDIA_ERR_DECODE`= 3
*   `MediaError.MEDIA_ERR_NONE_SUPPORTED`= 4