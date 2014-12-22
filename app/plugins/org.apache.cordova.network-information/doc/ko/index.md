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

이 플러그인 [네트워크 정보 API][1]의 이전 버전에 대 한 구현을 제공합니다. 소자의 셀룰러와 와이파이 연결에 대 한 정보를 제공 합니다 장치는 인터넷 연결에 있는지 여부.

 [1]: http://www.w3.org/TR/2011/WD-netinfo-api-20110607/

## 설치

    cordova plugin add org.apache.cordova.network-information
    

## 지원 되는 플랫폼

*   아마존 화재 운영 체제
*   안 드 로이드
*   블랙베리 10
*   브라우저
*   iOS
*   Windows Phone 7과 8
*   Tizen
*   윈도우 8
*   Firefox 운영 체제

# 연결

> `connection`개체를 통해 노출 `navigator.connection` , 소자의 셀룰러와 와이파이 연결에 대 한 정보를 제공 합니다.

## 속성

*   connection.type

## 상수

*   Connection.UNKNOWN
*   Connection.ETHERNET
*   Connection.WIFI
*   Connection.CELL_2G
*   Connection.CELL_3G
*   Connection.CELL_4G
*   Connection.CELL
*   Connection.NONE

## connection.type

이 디바이스의 네트워크 연결 상태를 확인 하는 빠른 방법을 제공 합니다 및 연결의 종류.

### 빠른 예제

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
    

### API 변경

코르 도우 바 2.3.0까지 `Connection` 개체를 통해 액세스 했습니다 `navigator.network.connection` , 후에 변경 된 `navigator.connection` W3C 사양에 맞게. 그것은 그것의 원래 위치에 계속 사용할 수 하지만 사용 되지 않습니다 및 결국 제거 될 것 이다.

### iOS 단점

*   iOS는 셀룰러 네트워크 연결의 종류를 감지할 수 없습니다. 
    *   `navigator.connection.type`로 설정 된 `Connection.CELL` 모든 셀룰러 데이터에 대 한.

### Windows Phone 단점

*   에뮬레이터에서 실행할 때 항상 검색 `navigator.connection.type` 으로`Connection.UNKNOWN`.

*   Windows Phone 셀룰러 네트워크 연결 유형을 검색할 수 없습니다.
    
    *   `navigator.connection.type`로 설정 된 `Connection.CELL` 모든 셀룰러 데이터에 대 한.

### Tizen 특수

*   Tizen은 와이파이 또는 휴대 전화 연결에만 검색할 수 있습니다. 
    *   `navigator.connection.type`로 설정 된 `Connection.CELL_2G` 모든 셀룰러 데이터에 대 한.

### 파이어 폭스 OS 단점

*   파이어 폭스 OS 셀룰러 네트워크 연결 유형을 검색할 수 없습니다. 
    *   `navigator.connection.type`로 설정 된 `Connection.CELL` 모든 셀룰러 데이터에 대 한.

# 네트워크 관련 이벤트

## offline

이벤트가 발생 하면 응용 프로그램 오프 라인, 이동 및 장치가 인터넷에 연결 되어 있지.

    document.addEventListener("offline", yourCallbackFunction, false);
    

### 세부 정보

`offline`이벤트가 발생 하면 응용 프로그램이 더 이상 인터넷에 액세스할 수 있도록 이전 연결 된 장치가 네트워크 연결 손실. 그것은 연결 API와 동일한 정보에 의존 하 고 경우의 값 `connection.type` 된다`NONE`.

일반적으로 응용 프로그램을 사용 해야 합니다 `document.addEventListener` 한번 이벤트 리스너를 연결 하는 `deviceready` 이벤트가 발생 합니다.

### 빠른 예제

    document.addEventListener("offline", onOffline, false);
    
    function onOffline() {
        // Handle the offline event
    }
    

### iOS 단점

처음 시작 하는 동안 첫 번째 오프 라인 이벤트 (있는 경우)를 적어도 초를 걸립니다.

### Windows Phone 7 단점

에뮬레이터에서 실행 하는 경우는 `connection.status` 항상 불명 하다, 그래서이 이벤트는 *없는* 불.

### Windows Phone 8 단점

에뮬레이터도 연결 형식을 보고 `Cellular` 는 변경 되지 않습니다, 그래서 이벤트 않습니다 *하지* 불.

## online

응용 프로그램은 온라인 및 장치가 인터넷에 연결 된다 때이 이벤트가 발생 합니다.

    document.addEventListener("online", yourCallbackFunction, false);
    

### 세부 정보

`online`이전 연결 되지 않은 장치는 인터넷에 대 한 응용 프로그램 액세스를 허용 하도록 네트워크 연결을 받을 때 이벤트가 발생 합니다. 그것은 연결 API와 동일한 정보에 의존 하 고 경우에 `connection.type` 에서 변경 `NONE` 다른 값으로.

일반적으로 응용 프로그램을 사용 해야 합니다 `document.addEventListener` 한번 이벤트 리스너를 연결 하는 `deviceready` 이벤트가 발생 합니다.

### 빠른 예제

    document.addEventListener("online", onOnline, false);
    
    function onOnline() {
        // Handle the online event
    }
    

### iOS 단점

처음 시작 하는 동안 첫 번째 `online` 이벤트 (있는 경우) 이전에 불 초 걸립니다 이상 `connection.type` 입니다`UNKNOWN`.

### Windows Phone 7 단점

에뮬레이터에서 실행 하는 경우는 `connection.status` 항상 불명 하다, 그래서이 이벤트는 *없는* 불.

### Windows Phone 8 단점

에뮬레이터도 연결 형식을 보고 `Cellular` 는 변경 되지 않습니다, 그래서 이벤트 않습니다 *하지* 불.