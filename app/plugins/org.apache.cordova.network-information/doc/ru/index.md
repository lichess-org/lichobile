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

Этот плагин обеспечивает реализацию старой версии [API Сетевой информации][1]. Он предоставляет информацию о сотовых и Wi-Fi подключениях устройства, и информацию имеет ли устройство подключение к Интернету.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## Установка

    cordova plugin add org.apache.cordova.network-information
    

## Поддерживаемые платформы

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Браузер
*   iOS
*   Windows Phone 7 и 8
*   Tizen
*   Windows 8
*   Firefox OS

# Connection

> Объект `connection`, доступный через `navigator.connection`, предоставляет информацию о сотовых и wifi подключениях устройства.

## Свойства

*   connection.type

## Константы

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

Это свойство предоставляет быстрый способ для определения состояния подключения устройства к сети и тип этого подключения.

### Краткий пример

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
    

### Изменения в API

До Cordova 2.3.0 объект `Connection` был доступен через `navigator.network.connection`, после чего это свойство было изменено на `navigator.connection` в соответствии со спецификацией консорциума W3C. Он все еще доступен в его исходном расположении, но это расположение является устаревшим и в конечном итоге будет удалено.

### Особенности iOS

*   iOS не может определить тип подключения к сотовой сети. 
    *   `navigator.connection.type` имеет значение `Connection.CELL` для всех сотовых данных.

### Особенности Windows Phone

*   Когда работает в эмуляторе, тип подключения всегда определяется `navigator.connection.type` как `Connection.UNKNOWN`.

*   Windows Phone не может определить тип подключения к сотовой сети.
    
    *   `navigator.connection.type` имеет значение `Connection.CELL` для всех сотовых данных.

### Особенности Tizen

*   Tizen может обнаружить только соединения Wi-Fi или наличие сотовой связи. 
    *   `navigator.connection.type` имеет значение `Connection.CELL_2G` для всех сотовых данных.

### Особенности Firefox OS

*   Firefox OS не может определить тип подключения к сотовой сети. 
    *   `navigator.connection.type` имеет значение `Connection.CELL` для всех сотовых данных.

# События, связанные с сетью

## offline

Событие возникает, когда приложение переходит в автономный режим, и устройство не подключено к сети Интернет.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### Подробности

Событие `offline` возникает, когда ранее подключенное устройство теряет подключение к сети, так что приложение больше не может получить доступ к Интернет. Он опирается на ту же информацию, что и Connection API и срабатывает, когда значение `connection.type` становится равным `NONE`.

Приложения обычно должно использовать `window.addEventListener` чтобы добавить обработчик события после того как произойдет событие `deviceready`.

### Краткий пример

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### Особенности iOS

Во время первоначального запуска первому событию offline (если применимо) требуется по крайней мере секунду на срабатывание.

### Особенности Windows Phone 7

Когда работает в эмуляторе, `connection.status` всегда неизвестен, так что это событие *не* срабатывает.

### Особенности Windows Phone 8

Эмулятор сообщает тип подключения как `Cellular` , которое не меняется, поэтому событие не *не* срабатывает.

## online

Это событие возникает, когда приложение выходит в онлайн, и устройство подключается к Интернету.

    document.addEventListener("online", yourCallbackFunction, false);
    

### Подробности

Событие `online` возникает, когда ранее не подключенное к сети устройство получает сетевое подключение, разрешающее приложению доступ к Интернету. Оно опирается на ту же информацию, Connection API и вызывается когда `connection.type` меняется с `NONE` в любое другое значение.

Приложения обычно должны использовать `window.addEventListener` чтобы добавить обработчик события после того как произойдет событие `deviceready`.

### Краткий пример

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### Особенности iOS

Во время первоначального запуска первое событие `online` (если применимо) занимает по меньшей мере секунду на срабатывание, до этого момента `connection.type` является равным `UNKNOWN`.

### Особенности Windows Phone 7

Когда работает в эмуляторе, `connection.status` всегда неизвестен, так что это событие *не* срабатывает.

### Особенности Windows Phone 8

Эмулятор сообщает тип подключения как `Cellular` , которое не меняется, поэтому событие не *не* срабатывает.