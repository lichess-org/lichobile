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

# org.apache.cordova.file

這個外掛程式提供了[HTML5 檔案系統 API][1]。 用法，請參閱 HTML5 岩石[檔案系統條][2]關於這個問題。 其他存儲選項的概述，請參閱科爾多瓦的[存儲指南][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## 安裝

    cordova plugin add org.apache.cordova.file
    

## 支援的平臺

*   亞馬遜火 OS
*   Android 系統
*   黑莓 10
*   iOS
*   Windows Phone 7 和 8 *
*   Windows 8 *
*   火狐瀏覽器作業系統

**這些平臺不支援 `FileReader.readAsArrayBuffer` ，也不 `FileWriter.write(blob)` .*

## 存儲檔的位置

自 v1.2.0，提供重要的檔案系統目錄的 Url。 每個 URL 是在表單*file:///path/to/spot/*，和可以轉換為 `DirectoryEntry` 使用`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-唯讀目錄應用程式的安裝位置。(*iOS* *Android*)

`cordova.file.applicationStorageDirectory`-應用程式的私有可寫存儲的根。(*iOS* *Android*)

`cordova.file.dataDirectory`-在何處放置應用程式特定的資料檔案。(*iOS* *Android*)

`cordova.file.cacheDirectory`-緩存應該生存重新開機應用程式的檔。應用程式不應依賴 OS，以刪除檔在這裡。(*iOS* *Android*)

`cordova.file.externalApplicationStorageDirectory`-應用程式外部存儲上的空間。(*iOS* *Android*)

`cordova.file.externalDataDirectory`-要把外部存儲的特定于應用程式資料檔案的位置。(*Android*)

`cordova.file.externalCacheDirectory`外部存儲的應用程式緩存。(*Android*)

`cordova.file.externalRootDirectory`-外部存儲 （SD 卡） 根。(*Android*)

`cordova.file.tempDirectory`-將 OS 可以清除時的 temp 目錄。(*iOS*)

`cordova.file.syncedDataDirectory`-持有應同步 （例如到 iCloud) 的應用程式特定的檔。(*iOS*)

`cordova.file.documentsDirectory`-檔專用的應用程式，但這是對其他 applciations （例如 Office 檔） 有意義。(*iOS*)

## Android 的怪癖

### Android 的永久存儲位置

有多個存儲持久性 Android 設備上的檔的有效位置。 請參閱[此頁][4]為廣泛地討論的各種可能性。

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

以前版本的外掛程式會選擇在啟動時，基於是否該設備聲稱 SD 卡 （或等效存儲分區） 安裝臨時和永久檔的位置。 如果被掛載 SD 卡，或者如果一個大的內部存儲分區是可用 （如 Nexus 的設備上，） 然後持久性檔將存儲在該空間的根。 這就意味著所有的科爾多瓦應用可以看到所有可用的檔在卡上。

如果 SD 卡不是可用的然後以前的版本會將資料存儲在下/資料/資料 /<packageid>其中隔離應用程式從彼此，但仍然可能會導致使用者之間共用資料。

現在可以選擇是否要將檔存儲在內部檔存儲位置，或使用以前的邏輯，在您的應用程式的 config.xml 檔首選項。 若要執行此操作，請將這兩行之一添加到 config.xml：

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

如果這條線，沒有檔外掛程式將作為預設值使用"相容性"。如果首選項標記是存在，並不是這些值之一，應用程式將無法啟動。

如果您的應用程式先前已經運送到使用者，使用較舊的 (預 1.0) 的這個外掛程式版本和已存儲的檔中的持久性的檔案系統，然後您應該設置的首選項的"相容性"。 切換到"內部"的位置就意味著現有使用者升級他們的應用程式可能無法訪問他們以前存儲的檔，他們的設備。

如果您的應用程式是新的或以前從未有持久性檔案系統中存儲的檔，然後通常會建議的"內部"的設置。

## iOS 的怪癖

*   `FileReader.readAsText(blob, encoding)` 
    *   `encoding`參數不受支援，和 utf-8 編碼總是有效。

### iOS 的持久性存儲位置

有兩個有效位置來存儲持久性的 iOS 設備上的檔： 檔目錄和庫目錄。 以前版本的外掛程式只過持久性檔存儲在檔目錄中。 這有副作用 — — 使所有的應用程式的檔可見在 iTunes 中，往往是意料之外的特別是為處理大量小檔的應用程式，而不是生產用於出口，是預期的目的的目錄的完整的檔。

現在可以選擇是否要將檔存儲在檔或庫目錄，與您的應用程式的 config.xml 檔中的偏好。 若要執行此操作，請將這兩行之一添加到 config.xml：

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

如果這條線，沒有檔外掛程式將作為預設值使用"相容性"。如果首選項標記是存在，並不是這些值之一，應用程式將無法啟動。

如果您的應用程式先前已經運送到使用者，使用較舊的 (預 1.0) 的這個外掛程式版本和已存儲的檔中的持久性的檔案系統，然後您應該設置的首選項的"相容性"。 切換到"庫"的位置意味著升級他們的應用程式的現有使用者將無法訪問他們以前存儲的檔。

如果您的應用程式是新的或以前從未有持久性檔案系統中存儲的檔，然後通常會建議"的庫"設置。

### 火狐瀏覽器作業系統的怪癖

檔案系統 API 本機作業系統不支援火狐瀏覽器，在 indexedDB shim 作為實現的。

*   不會失敗時刪除非空的目錄
*   不支援用中繼資料的目錄
*   不支援 `requestAllFileSystems` 和 `resolveLocalFileSystemURI` 的方法
*   方法 `copyTo` 和 `moveTo` 不支援目錄

## 升級說明

在此外掛程式 v1.0.0 `FileEntry` 和 `DirectoryEntry` 結構已經更改，以更符合已發佈的規範。

以前 (pre-1.0.0） 版本的外掛程式存儲的設備-絕對-檔-位置在 `fullPath` 屬性的 `Entry` 物件。這些路徑通常看起來就像

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

這些路徑還返回的 `toURL()` 方法的 `Entry` 物件。

與 v1.0.0， `fullPath` 屬性是對該檔*的 HTML 檔案系統根目錄的相對*路徑。 因此，上述路徑會現在兩者都由表示 `FileEntry` 物件與 `fullPath` 的

    /path/to/file
    

如果您的應用程式與設備-絕對路徑，和你以前檢索到這些路徑通過 `fullPath` 屬性的 `Entry` 物件，然後你應該更新您的代碼以使用 `entry.toURL()` 相反。

為向後相容性， `resolveLocalFileSystemURL()` 方法將接受絕對設備的路徑，並將返回 `Entry` 對應于它，只要該檔存在的臨時或永久性的檔案系統內的物件。

這特別是一直帶有檔案傳輸外掛程式，以前使用過的設備絕對路徑的問題 (和仍然可以接受他們)。 它已更新為與檔案系統的 Url，所以取代正常工作 `entry.fullPath` 與 `entry.toURL()` 應解決獲取該外掛程式來處理檔的設備上的任何問題。

V1.1.0 的傳回值中的 `toURL()` 已更改 （請參見 \[CB-6394\] (HTTPs://issues.apache.org/jira/browse/CB-6394)） 返回一個絕對 'file:// URL。 在可能的情況。 為確保 ' cdvfile:'-您可以使用的 URL `toInternalURL()` 現在。 現在，此方法將返回該表單的檔案系統 Url

    cdvfile://localhost/persistent/path/to/file
    

它可以用於唯一地標識該檔。

## 錯誤代碼和含義的清單

錯誤引發時，將使用以下代碼之一。

*   1 = NOT\_FOUND\_ERR
*   2 = SECURITY_ERR
*   3 = ABORT_ERR
*   4 = NOT\_READABLE\_ERR
*   5 = ENCODING_ERR
*   6 = NO\_MODIFICATION\_ALLOWED_ERR
*   7 = INVALID\_STATE\_ERR
*   8 = SYNTAX_ERR
*   9 = INVALID\_MODIFICATION\_ERR
*   10 = QUOTA\_EXCEEDED\_ERR
*   11 = TYPE\_MISMATCH\_ERR
*   12 = PATH\_EXISTS\_ERR

## 配置的外掛程式 （可選）

可用的檔案系統的一組可配置的每個平臺。IOS 和 android 系統識別 <preference> 在中添加標籤 `config.xml` 的名字要安裝的檔案系統。預設情況下，啟用所有檔案系統根。

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android 系統

*   檔: 應用程式的內部檔存儲目錄
*   檔外部： 應用程式的外部檔存儲目錄
*   sdcard： 全球外部檔存儲目錄 （如果安裝了一個，這是 SD 卡的根目錄）。 您必須具有 `android.permission.WRITE_EXTERNAL_STORAGE` 使用此許可權。
*   快取記憶體： 應用程式的內部緩存目錄
*   外部快取記憶體： 應用程式的外部快取記憶體目錄
*   根： 整個設備的檔案系統

Android 還支援名為"檔"，它表示"檔的"檔案系統中的子目錄"/ 檔 /"特別的檔案系統。

### iOS

*   圖書館： 應用程式的庫目錄
*   文檔： 應用程式的檔目錄
*   快取記憶體： 應用程式的緩存目錄
*   束： 束應用程式的 ；應用程式本身 （唯讀） 的磁片上的位置
*   根： 整個設備的檔案系統

預設情況下，圖書館和檔目錄可以同步到 iCloud。 你也可以要求兩個附加檔案系統、"圖書館-非同步"和"文檔-nosync"，代表特別的非同步的目錄內的庫或檔的檔案系統。