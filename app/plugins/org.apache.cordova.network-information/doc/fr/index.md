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

# org.apache.cordova.network-information

Ce plugin fournit une implémentation d'une ancienne version de l' [API Information Network][1]. Il fournit des informations sur l'appareil cellulaire et connexion wifi, et si l'appareil dispose d'une connexion internet.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Installation

    cordova plugin add org.apache.cordova.network-information
    

## Plates-formes prises en charge

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Navigateur
*   iOS
*   Windows Phone 7 et 8
*   Paciarelli
*   Windows 8
*   Firefox OS

# Connexion

> L'objet `connection`, disponible via `navigator.connection`, fournit des informations sur la connection cellulaire/wifi de l'appareil.

## Propriétés

*   connection.type

## Constantes

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

Cette propriété offre un moyen rapide pour déterminer l'état et le type de la connexion réseau de l'appareil.

### Petit exemple

    function checkConnection() {
        var networkState = navigator.connection.type;
    
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
    
        alert('Connection type: ' + states[networkState]);
    }
    
    checkConnection();
    

### Changement d'API

Jusqu'à Cordova 2.3.0, l'objet `Connection` était accessible via `navigator.network.connection` ; ceci a été changé pour `navigator.connection` afin de concorder avec la spécification du W3C. L'accès est toujours possible à l'emplacement d'origine, mais est considéré comme obsolète et sera bientôt supprimé.

### iOS Quirks

*   iOS ne peut pas détecter le type de connexion au réseau cellulaire. 
    *   `navigator.connection.type`a la valeur `Connection.CELL` pour toutes les données cellulaires.

### Windows Phone Quirks

*   Lors de l'exécution dans l'émulateur, détecte toujours `navigator.connection.type` comme`Connection.UNKNOWN`.

*   Windows Phone ne peut pas détecter le type de connexion au réseau cellulaire.
    
    *   `navigator.connection.type`a la valeur `Connection.CELL` pour toutes les données cellulaires.

### Bizarreries de paciarelli

*   Paciarelli peut uniquement détecter une connexion cellulaire ou bien WiFi. 
    *   `navigator.connection.type`a la valeur `Connection.CELL_2G` pour toutes les données cellulaires.

### Firefox OS Quirks

*   Firefox OS ne peut pas détecter le type de connexion au réseau cellulaire. 
    *   `navigator.connection.type`a la valeur `Connection.CELL` pour toutes les données cellulaires.

# Événements liés au réseau

## offline

L'évènement se déclenche lorsqu'une application se déconnecte, quand l'appareil n'est pas connecté à Internet.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Détails

L'évènement `offline` se déclenche lorsqu'un appareil précédemment connecté perd sa connexion au réseau, empêchant ainsi l'application d'accéder à Internet. Il s'appuie sur les mêmes informations que l'API de connexion et se déclenche lorsque la valeur de `connection.type` devient`NONE`.

Les applications doivent généralement utiliser `document.addEventListener` pour attacher un écouteur d'événements une fois le `deviceready` événement se déclenche.

### Petit exemple

    document.addEventListener (« hors ligne », onOffline, false) ;
    
    function onOffline() {/ / gestion de l'événement en mode hors connexion}
    

### iOS Quirks

Lors du démarrage initial, le déclenchement du premier évènement offline (si applicable) prend au moins une seconde.

### Windows Phone 7 Quirks

Lors de l'exécution dans l'émulateur, le `connection.status` est toujours inconnu, ainsi cet événement ne fait *pas* de feu.

### Windows Phone 8 Quirks

L'émulateur signale le type de connexion comme `Cellular`, type qui ne change jamais, ainsi l'évènement n'est *pas* déclenché.

## online

L'évènement se déclenche lorsqu'une application se connecte, quand l'appareil est connecté à Internet.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Détails

L'évènement `online` se déclenche lorsqu'un appareil précédemment non-connecté se connecte au réseau, permettant ainsi à l'application d'accéder à Internet. Il s'appuie sur les mêmes informations que l'API de connexion et se déclenche quand le `connection.type` passe de `NONE` à une autre valeur.

Les applications doivent généralement utiliser `document.addEventListener` pour attacher un écouteur d'événements une fois le `deviceready` événement se déclenche.

### Petit exemple

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS Quirks

Lors du démarrage initial, le déclenchement du premier évènement `online` (si applicable) prend au moins une seconde avant quoi `connection.type` vaut `UNKNOWN`.

### Windows Phone 7 Quirks

Lors de l'exécution dans l'émulateur, le `connection.status` est toujours inconnu, ainsi cet événement ne fait *pas* de feu.

### Windows Phone 8 Quirks

L'émulateur signale le type de connexion comme `Cellular` , qui ne change pas, aussi des événements ne fait *pas* de feu.