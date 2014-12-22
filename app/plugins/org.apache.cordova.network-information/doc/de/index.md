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

Dieses Plugin stellt eine Implementierung einer alten Version der [Netzwerk-Informationen-API][1]. Es werden Informationen über das Gerät Mobilfunk und Wifi-Anschluss, und ob das Gerät über eine Internetverbindung verfügt.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Installation

    cordova plugin add org.apache.cordova.network-information
    

## Unterstützte Plattformen

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Browser
*   iOS
*   Windows Phone 7 und 8
*   Tizen
*   Windows 8
*   Firefox OS

# Verbindung

> Das `connection` Objekt, verfügbar gemachten über `navigator.connection`, enthält Informationen über die Mobilfunk- und Wi-Fi-Verbindung des Gerätes.

## Eigenschaften

*   connection.type

## Konstanten

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

Diese Eigenschaft bietet eine schnelle Möglichkeit, um den Netzwerkverbindungsstatus und die Art der Verbindung zu bestimmen.

### Kurzes Beispiel

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
    

### API Änderung

Bis Cordova 2.3.0 wurde auf das `Connection` Objekt über `navigator.network.connection` zugegriffen, danach wurde der Zugriff auf `navigator.connection` geändert, um der W3C-Spezifikation zu entsprechen. Es steht immer noch an seiner ursprünglichen Stelle, aber ist veraltet und wird schliesslich entfernt.

### iOS Macken

*   iOS kann Mobilfunknetz Verbindungstyp nicht erkennen. 
    *   `navigator.connection.type`auf festgelegt ist `Connection.CELL` für alle Handy-Daten.

### Windows Phone Macken

*   Wenn im Emulator ausgeführt wird, erkennt immer `navigator.connection.type` als`Connection.UNKNOWN`.

*   Windows Phone kann Mobilfunknetz Verbindungstyp nicht erkennen.
    
    *   `navigator.connection.type`auf festgelegt ist `Connection.CELL` für alle Handy-Daten.

### Tizen Macken

*   Tizen kann nur eine Wi-Fi- oder Mobilfunkverbindung erkennen. 
    *   `navigator.connection.type`auf festgelegt ist `Connection.CELL_2G` für alle Handy-Daten.

### Firefox OS Macken

*   Firefox-OS kann Mobilfunknetz Verbindungstyp nicht erkennen. 
    *   `navigator.connection.type`auf festgelegt ist `Connection.CELL` für alle Handy-Daten.

# Netzwerk-Veranstaltungen

## offline

Das Ereignis wird ausgelöst, wenn eine Anwendung offline geht, und das Gerät nicht mit dem Internet verbunden ist.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Details

Das `offline` -Ereignis wird ausgelöst, wenn ein bereits angeschlossenes Gerät eine Netzwerkverbindung verliert, so dass eine Anwendung nicht mehr auf das Internet zugreifen kann. Es stützt sich auf die gleichen Informationen wie die Verbindung-API und wird ausgelöst, wenn der Wert des `connection.type` wird`NONE`.

Anwendungen sollten in der Regel verwenden `document.addEventListener` einmal einen Ereignis-Listener hinzufügen das `deviceready` -Ereignis ausgelöst.

### Kurzes Beispiel

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS Macken

Beim ersten Start dauert das erste offline-Event (falls zutreffend) mindestens eine Sekunde zu schießen.

### Windows Phone 7 Macken

Bei der Ausführung im Emulator, der `connection.status` ist immer unbekannt, so dass dieses Ereignis *nicht* Feuer.

### Windows Phone 8 Macken

Der Emulator meldet den Verbindungstyp als `Cellular` , die wird nicht geändert, so dass das Ereignis *nicht* Feuer.

## online

Dieses Ereignis wird ausgelöst, wenn eine Anwendung online geht, und das Gerät wird mit dem Internet verbunden.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Details

Das `online` -Ereignis wird ausgelöst, wenn ein zuvor unverbundenen Gerät eine Netzwerkverbindung zu einem Anwendung Zugriff auf das Internet empfängt. Es stützt sich auf die gleichen Informationen wie die Verbindung-API und wird ausgelöst, wenn die `connection.type` ändert sich von `NONE` auf einen anderen Wert.

Anwendungen sollten in der Regel verwenden `document.addEventListener` einmal einen Ereignis-Listener hinzufügen das `deviceready` -Ereignis ausgelöst.

### Kurzes Beispiel

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS Macken

Beim ersten Start die erste `online` Ereignis (falls zutreffend) dauert mindestens eine Sekunde vor dem Feuer `connection.type` ist`UNKNOWN`.

### Windows Phone 7 Macken

Bei der Ausführung im Emulator, der `connection.status` ist immer unbekannt, so dass dieses Ereignis *nicht* Feuer.

### Windows Phone 8 Macken

Der Emulator meldet den Verbindungstyp als `Cellular` , die wird nicht geändert, so dass Ereignisse *nicht* Feuer.