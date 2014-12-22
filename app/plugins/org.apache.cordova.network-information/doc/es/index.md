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

Este plugin proporciona una implementación de una versión antigua de la [Red de información API][1]. Proporciona información acerca del dispositivo móvil y conexión wifi, y si el dispositivo tiene una conexión a internet.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Instalación

    cordova plugin add org.apache.cordova.network-information
    

## Plataformas soportadas

*   Amazon fire OS
*   Android
*   BlackBerry 10
*   Explorador
*   iOS
*   Windows Phone 7 y 8
*   Tizen
*   Windows 8
*   Firefox OS

# Conexión

> El objeto de `connection`, expuesto a través de `navigator.connection`, proporciona información sobre conexión celular y wifi del dispositivo.

## Propiedades

*   connection.type

## Constantes

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_4G
*   Connection.CELL_3G
*   Connection.CELL
*   Connection.NONE

## connection.type

Esta propiedad ofrece una forma rápida de determinar el estado de conexión de red del dispositivo y el tipo de conexión.

### Ejemplo rápido

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
    

### Cambio de API

Hasta Cordova 2.3.0, el objeto de `conexión` era acceder a través de `navigator.network.connection`, tras lo cual fue cambiada a `navigator.connection` para que coincida con la especificación del W3C. Sigue estando disponible en su ubicación original, pero es obsoleto y eventualmente desaparecerá.

### iOS rarezas

*   iOS no puede detectar el tipo de conexión de red celular. 
    *   `navigator.connection.type` está establecido en `Connection.CELL` para todos los datos de celulares.

### Windows Phone rarezas

*   Cuando se ejecuta en el emulador, siempre detecta `navigator.connection.type` como `Connection.UNKNOWN`.

*   Windows Phone no puede detectar el tipo de conexión de red celular.
    
    *   `navigator.connection.type` está establecido en `Connection.CELL` para todos los datos de celulares.

### Rarezas Tizen

*   Tizen sólo puede detectar un Wi-Fi o conexión celular. 
    *   `navigator.connection.type` está establecido en `Connection.CELL_2G` para todos los datos de celulares.

### Firefox OS rarezas

*   Firefox OS no puede detectar el tipo de conexión de red celular. 
    *   `navigator.connection.type` está establecido en `Connection.CELL` para todos los datos de celulares.

# Eventos relacionados con la red

## offline

El evento se desencadena cuando una aplicación está desconectada, y el dispositivo no está conectado a Internet.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Detalles

El evento `offline` se desencadena cuando un dispositivo conectado previamente pierde una conexión de red para que una aplicación no puede acceder a Internet. Se basa en la misma información que la API de conexión y cuando se dispara el valor del `connection.type` se convierte`NONE`.

Las aplicaciones normalmente deben utilizar `document.addEventListener` para conectar un detector de eventos una vez que se desencadene el evento `deviceready`.

### Ejemplo rápido

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS rarezas

Durante el arranque inicial, el primer evento offline (si es aplicable) tarda al menos un segundo en fuego.

### Windows Phone 7 rarezas

Cuando se ejecuta en el emulador, la `connection.status` siempre es desconocido, así que este evento no se ** fuego.

### Windows Phone 8 rarezas

El emulador informa el tipo de conexión como `celular`, que no cambia, así que el evento *no se* fuego.

## online

Este evento se desencadena cuando una aplicación va en línea, y el dispositivo se conecta a Internet.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Detalles

El evento `online` se desencadena cuando un dispositivo previamente inconexos recibe una conexión de red para permitir un acceso a las aplicaciones para Internet. Se basa en la misma información que la API de conexión y se desencadena cuando el `connection.type` cambia de `ninguno` a cualquier otro valor.

Las aplicaciones normalmente deben utilizar `document.addEventListener` para conectar un detector de eventos una vez que se desencadene el evento `deviceready`.

### Ejemplo rápido

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS rarezas

Durante el arranque inicial, el primer evento `en línea` (si procede) al menos toma un segundo para disparar, antes de que `connection.type` es `desconocido`.

### Windows Phone 7 rarezas

Cuando se ejecuta en el emulador, la `connection.status` siempre es desconocido, así que este evento no se ** fuego.

### Windows Phone 8 rarezas

El emulador, informa el tipo de conexión como `Cellular` , que no cambia, así que se lo eventos *no* fuego.