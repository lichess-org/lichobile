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

このプラグインは、古いバージョンの[ネットワーク情報 API][1]の実装を提供します。 デバイスの携帯電話や wifi 接続に関する情報を提供し、かどうか、デバイスがインターネットに接続します。

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## インストール

    cordova plugin add org.apache.cordova.network-information
    

## サポートされているプラットフォーム

*   アマゾン火 OS
*   アンドロイド
*   ブラックベリー 10
*   ブラウザー
*   iOS
*   Windows Phone 7 と 8
*   Tizen
*   Windows 8
*   Firefox の OS

# 接続

> `connection`オブジェクトによって公開されて `navigator.connection` 、デバイスの携帯電話や wifi 接続に関する情報を提供します。

## プロパティ

*   connection.type

## 定数

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

このプロパティはデバイスのネットワーク接続状態を確認する速い方法を提供し、接続の種類。

### 簡単な例

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
    

### API の変更

コルドバ 2.3.0、まで、 `Connection` 経由でアクセスされたオブジェクトが `navigator.network.connection` 、それに変更されましたが後 `navigator.connection` W3C の仕様に一致します。 それはまだ元の場所は廃止され、最終的に削除されます。

### iOS の癖

*   iOS は、携帯電話のネットワーク接続の種類を検出できません。 
    *   `navigator.connection.type`設定する `Connection.CELL` すべての携帯電話データの。

### Windows Phone の癖

*   エミュレーターで実行しているときを常に検出 `navigator.connection.type` として`Connection.UNKNOWN`.

*   Windows Phone 携帯電話ネットワーク接続の種類を検出できません。
    
    *   `navigator.connection.type`設定する `Connection.CELL` すべての携帯電話データの。

### Tizen の癖

*   Tizen には、WiFi または携帯電話の接続だけを検出できます。 
    *   `navigator.connection.type`設定する `Connection.CELL_2G` すべての携帯電話データの。

### Firefox OS 癖

*   Firefox の OS は、携帯電話のネットワーク接続の種類を検出できません。 
    *   `navigator.connection.type`設定する `Connection.CELL` すべての携帯電話データの。

# ネットワーク関連のイベント

## offline

アプリケーションがオフラインになり、デバイスがインターネットに接続されていないときに発生します。

    document.addEventListener("offline", yourCallbackFunction, false);
    

### 詳細

`offline`アプリケーションはもはや、インターネットにアクセスできるように、以前接続されたデバイスは、ネットワーク接続が失われたときに発生します。 接続 API と同じ情報に依存しており、火災時の値 `connection.type` になります。`NONE`.

通常アプリケーションに使用する必要があります `document.addEventListener` 一度のイベント リスナーをアタッチし、 `deviceready` イベントが発生します。

### 簡単な例

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS の癖

初回起動時 (当てはまる場合) の最初のオフライン イベントは火に 1 秒以上かかります。

### Windows Phone 7 の癖

エミュレーターで実行しているとき、 `connection.status` は常に知られている、このイベントは*ない*火。

### Windows Phone 8 癖

エミュレーターと接続の種類のレポート `Cellular` は変化しません、イベントは*ない*火。

## online

アプリケーションは、オンラインになるし、デバイスがインターネットに接続するときに発生します。

    document.addEventListener("online", yourCallbackFunction, false);
    

### 詳細

`online`以前接続されていないデバイスが、インターネットへのアプリケーション アクセスを許可するネットワーク接続を受信するときに発生します。 接続 API と同じ情報に依存しており、場合に適用されます、 `connection.type` から変更 `NONE` 以外の値にします。

通常アプリケーションに使用する必要があります `document.addEventListener` 一度のイベント リスナーをアタッチし、 `deviceready` イベントが発生します。

### 簡単な例

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS の癖

初回起動時には、最初の `online` (当てはまる場合) イベントが少なくとも火を前に第 2 `connection.type` は`UNKNOWN`.

### Windows Phone 7 の癖

エミュレーターで実行しているとき、 `connection.status` は常に知られている、このイベントは*ない*火。

### Windows Phone 8 癖

エミュレーターと接続の種類のレポート `Cellular` は変化しません、イベントは*ない*火。