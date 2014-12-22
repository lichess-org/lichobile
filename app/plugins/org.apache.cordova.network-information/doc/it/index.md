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

Questo plugin fornisce un'implementazione di una vecchia versione dell' [API di informazioni di rete][1]. Fornisce informazioni sul dispositivo cellulare e connessione wifi, e se il dispositivo dispone di una connessione internet.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Installazione

    cordova plugin add org.apache.cordova.network-information
    

## Piattaforme supportate

*   Amazon fuoco OS
*   Android
*   BlackBerry 10
*   Browser
*   iOS
*   Windows Phone 7 e 8
*   Tizen
*   Windows 8
*   Firefox OS

# Connessione

> Il `connection` oggetto, esposto tramite `navigator.connection` , fornisce informazioni sulla connessione wifi e cellulare del dispositivo.

## Proprietà

*   connection.type

## Costanti

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

Questa proprietà offre un modo rapido per determinare stato della connessione di rete del dispositivo e il tipo di connessione.

### Esempio rapido

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
    

### Cambiamento di API

Fino a Cordova 2.3.0, il `Connection` oggetto era accessibile tramite `navigator.network.connection` , dopo che è stato cambiato in `navigator.connection` per abbinare la specifica W3C. È ancora disponibile nella sua posizione originale, ma è obsoleto e verrà rimosso alla fine.

### iOS stranezze

*   iOS non è possibile rilevare il tipo di connessione di rete cellulare. 
    *   `navigator.connection.type`è impostata su `Connection.CELL` per tutti i dati cellulare.

### Stranezze di Windows Phone

*   Quando è in esecuzione nell'emulatore, rileva sempre `navigator.connection.type` come`Connection.UNKNOWN`.

*   Windows Phone non riesce a rilevare il tipo di connessione di rete cellulare.
    
    *   `navigator.connection.type`è impostata su `Connection.CELL` per tutti i dati cellulare.

### Tizen stranezze

*   Tizen può rilevare solo un WiFi o una connessione cellulare. 
    *   `navigator.connection.type`è impostata su `Connection.CELL_2G` per tutti i dati cellulare.

### Firefox OS stranezze

*   Sistema operativo Firefox non riesce a rilevare il tipo di connessione di rete cellulare. 
    *   `navigator.connection.type`è impostata su `Connection.CELL` per tutti i dati cellulare.

# Eventi relativi alla rete

## offline

L'evento viene generato quando un'applicazione passa alla modalità offline, e il dispositivo non è connesso a Internet.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Dettagli

Il `offline` evento viene generato quando un dispositivo precedentemente connesso perde una connessione di rete in modo che un'applicazione non è più possibile accedere a Internet. Esso si basa sulle stesse informazioni come l'API di connessione e viene generato quando il valore di `connection.type` diventa`NONE`.

Applicazioni in genere è necessario utilizzare `document.addEventListener` per fissare un listener di eventi una volta il `deviceready` evento incendi.

### Esempio rapido

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS stranezze

Durante l'avvio iniziale, il primo evento offline (se applicabile) richiede almeno un secondo al fuoco.

### Windows Phone 7 capricci

Quando è in esecuzione nell'emulatore, il `connection.status` è sempre sconosciuto, così fa di questo evento *non* fuoco.

### Windows Phone 8 stranezze

L'emulatore riporta il tipo di connessione come `Cellular` , che non cambia, così fa l'evento *non* fuoco.

## online

Questo evento viene generato quando un'applicazione va online, e il dispositivo diventa collegato a Internet.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Dettagli

Il `online` evento viene generato quando un dispositivo precedentemente scollegato riceve una connessione di rete per consentire un'accesso di applicazione a Internet. Esso si basa sulle stesse informazioni come l'API di connessione e viene attivato quando il `connection.type` cambia da `NONE` a qualsiasi altro valore.

Applicazioni in genere è necessario utilizzare `document.addEventListener` per fissare un listener di eventi una volta il `deviceready` evento incendi.

### Esempio rapido

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS stranezze

Durante l'avvio iniziale, il primo `online` evento (se applicabile) richiede almeno un secondo al fuoco, prima che `connection.type` è`UNKNOWN`.

### Windows Phone 7 capricci

Quando è in esecuzione nell'emulatore, il `connection.status` è sempre sconosciuto, così fa di questo evento *non* fuoco.

### Windows Phone 8 stranezze

L'emulatore riporta il tipo di connessione come `Cellular` , che non cambia, quindi, non gli eventi *non* a fuoco.