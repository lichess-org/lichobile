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

Wtyczka stanowi implementację starą wersję [API informacji w sieci][1]. Udostępnia informacje na temat urządzenia komórkowe i wifi połączenie, i czy urządzenie ma połączenie z Internetem.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Instalacja

    cordova plugin add org.apache.cordova.network-information
    

## Obsługiwane platformy

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Przeglądarka
*   iOS
*   Windows Phone 7 i 8
*   Tizen
*   Windows 8
*   Firefox OS

# Połączenie

> `connection`Obiektu, wystawiony przez `navigator.connection` , zawiera informacje o połączeniu urządzenia komórkowe i wifi.

## Właściwości

*   Connection.Type

## Stałe

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## Connection.Type

Oferuje szybki sposób ustalić stan połączenia sieciowego urządzenia i typ połączenia.

### Szybki przykład

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
    

### Zmiana interfejsu API

Do Cordova 2.3.0 `Connection` obiekt uzyskano za pośrednictwem `navigator.network.connection` , po którym został zmieniony na `navigator.connection` odpowiadać specyfikacji W3C. To jest nadal dostępne w jego oryginalnej lokalizacji, ale jest niezalecane i zostaną ostatecznie usunięte.

### Dziwactwa iOS

*   iOS nie może wykryć typ połączenia w sieci komórkowej. 
    *   `navigator.connection.type`jest zestaw `Connection.CELL` dla wszystkich komórek danych.

### Windows Phone dziwactwa

*   Po uruchomieniu w emulatorze, zawsze wykrywa `navigator.connection.type` jako`Connection.UNKNOWN`.

*   Windows Phone nie może wykryć typ połączenia w sieci komórkowej.
    
    *   `navigator.connection.type`jest zestaw `Connection.CELL` dla wszystkich komórek danych.

### Dziwactwa Tizen

*   Tizen można tylko dostrzegać Wi-Fi lub połączenia komórkowe. 
    *   `navigator.connection.type`jest zestaw `Connection.CELL_2G` dla wszystkich komórek danych.

### Firefox OS dziwactwa

*   Firefox OS nie można wykryć typ połączenia w sieci komórkowej. 
    *   `navigator.connection.type`jest zestaw `Connection.CELL` dla wszystkich komórek danych.

# Zdarzenia związane z sieci

## offline

Zdarzenie odpala gdy aplikacja przejdzie do trybu offline, a urządzenie nie jest podłączone do Internetu.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Szczegóły

`offline`Zdarzenie fires po wcześniej podłączone urządzenie traci połączenia z siecią, dzięki czemu aplikacja może już dostęp do Internetu. Opiera się na te same informacje połączenia API i gdy odpalam wartość `connection.type` staje się`NONE`.

Aplikacje zwykle należy użyć `document.addEventListener` Aby dołączyć słuchacza raz `deviceready` pożary zdarzenia.

### Szybki przykład

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### Dziwactwa iOS

Podczas uruchamiania systemu pierwsza impreza offline (jeśli dotyczy) trwa co najmniej drugi ognia.

### Dziwactwa Windows Phone 7

Po uruchomieniu w emulatorze, `connection.status` zawsze jest nieznana, więc to wydarzenie *nie* ogień.

### Windows Phone 8 dziwactwa

Emulator raporty typ połączenia, jako `Cellular` , co nie zmienia, więc zdarzenie *nie* ogień.

## online

Wydarzenie to odpala gdy aplikacja przechodzi w tryb online i urządzenie staje się połączenie z Internetem.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Szczegóły

`online`Zdarzenie odpala gdy wcześniej niezwiązane urządzenie odbiera połączenie sieciowe, aby umożliwić aplikacji dostęp do Internetu. Opiera się na te same informacje połączenia API i gdy odpalam `connection.type` zmienia się z `NONE` na inną wartość.

Aplikacje zwykle należy użyć `document.addEventListener` Aby dołączyć słuchacza raz `deviceready` pożary zdarzenia.

### Szybki przykład

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### Dziwactwa iOS

Podczas uruchamiania systemu pierwszy `online` zdarzenia (w stosownych przypadkach) zajmuje co najmniej drugie ognia, przed którym `connection.type` jest`UNKNOWN`.

### Dziwactwa Windows Phone 7

Po uruchomieniu w emulatorze, `connection.status` zawsze jest nieznana, więc to wydarzenie *nie* ogień.

### Windows Phone 8 dziwactwa

Emulator sprawozdania jako typ połączenia `Cellular` , które nie zmienia, więc wydarzenia czy *nie* ogień.