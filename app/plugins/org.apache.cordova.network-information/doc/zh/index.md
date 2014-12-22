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

這個外掛程式提供的舊版本的[網路資訊 API][1]實現的。 它提供了有關該設備的行動電話和無線網路連接的資訊和設備是否已連接到 internet。

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## 安裝

    cordova plugin add org.apache.cordova.network-information
    

## 支援的平臺

*   亞馬遜火 OS
*   Android 系統
*   黑莓 10
*   瀏覽器
*   iOS
*   Windows Phone 7 和 8
*   泰
*   Windows 8
*   火狐瀏覽器的作業系統

# 連接

> `connection`物件，通過公開 `navigator.connection` ，提供了有關該設備的行動電話和無線網路連接的資訊。

## 屬性

*   connection.type

## 常量

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

此屬性提供快速的方法來確定設備的網路連接狀態，和連線類型。

### 快速的示例

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
    

### API 更改

科爾多瓦 2.3.0，直到 `Connection` 物件的訪問通過 `navigator.network.connection` 後才改為其中, `navigator.connection` 以匹配的 W3C 規範。 它在其原始位置，是仍然可用，但已廢棄，最終將被刪除。

### iOS 的怪癖

*   iOS 無法檢測到蜂窩網路連接的類型。 
    *   `navigator.connection.type`設置為 `Connection.CELL` 為所有蜂窩資料。

### Windows Phone 怪癖

*   當運行在模擬器中，總能檢測到 `navigator.connection.type` 作為`Connection.UNKNOWN`.

*   Windows Phone 不能檢測的蜂窩網路連接的類型。
    
    *   `navigator.connection.type`設置為 `Connection.CELL` 為所有蜂窩資料。

### Tizen 怪癖

*   Tizen 只可以檢測一個 WiFi 或者蜂窩連接。 
    *   `navigator.connection.type`設置為 `Connection.CELL_2G` 為所有蜂窩資料。

### 火狐瀏覽器作業系統的怪癖

*   火狐瀏覽器作業系統無法檢測到蜂窩網路連接的類型。 
    *   `navigator.connection.type`設置為 `Connection.CELL` 為所有蜂窩資料。

# 與網路相關的事件

## offline

當一個應用程式離線時，與該設備未連接到互聯網時，將觸發該事件。

    document.addEventListener("offline", yourCallbackFunction, false);
    

### 詳細資訊

`offline`以前連接的設備失去網路連接，這樣，應用程式不再可以訪問互聯網時激發的事件。 它依賴于連接 API，相同的資訊和火災時的值 `connection.type` 變得`NONE`.

應用程式通常應使用 `document.addEventListener` 將一個事件攔截器附加一次 `deviceready` 事件火災。

### 快速的示例

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS 的怪癖

在初始啟動期間，第一次離線事件 （如果適用） 需至少一秒的火。

### Windows Phone 7 的怪癖

當運行在模擬器中， `connection.status` 始終是未知的因此此事件不會*不*火。

### Windows Phone 8 怪癖

模擬程式報告連線類型為 `Cellular` ，而不會更改，所以該事件不會*不*火。

## online

當應用程式進入線上狀態，和該設備將成為連接到互聯網時觸發此事件。

    document.addEventListener("online", yourCallbackFunction, false);
    

### 詳細資訊

`online`當先前連接的行動裝置接收到一個網路連接以允許應用程式訪問互聯網時激發的事件。 它依賴于連接 API，相同的資訊，則會激發 `connection.type` 從更改 `NONE` 為任何其他值。

應用程式通常應使用 `document.addEventListener` 將一個事件攔截器附加一次 `deviceready` 事件火災。

### 快速的示例

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS 的怪癖

在初始啟動期間第一次 `online` 事件 （如果適用），至少需一秒的火災之前的, `connection.type` 是`UNKNOWN`.

### Windows Phone 7 的怪癖

當運行在模擬器中， `connection.status` 始終是未知的因此此事件不會*不*火。

### Windows Phone 8 怪癖

模擬程式報告連線類型為 `Cellular` ，而不會更改，所以事件不**火。