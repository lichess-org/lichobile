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

このプラグインは、 [HTML5 ファイル システム API][1]を提供します。 使用状況、件名に HTML5 岩 '[ファイルシステムの記事][2]を参照してください。 他のストレージ オプションの概要については、コルドバの[ストレージ ・ ガイド][3]を参照してください。.

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## インストール

    cordova plugin add org.apache.cordova.file
    

## サポートされているプラットフォーム

*   アマゾン火 OS
*   アンドロイド
*   ブラックベリー 10
*   iOS
*   Windows Phone 7 と 8 *
*   Windows 8 *
*   Firefox の OS

**これらのプラットフォームがサポートしていない `FileReader.readAsArrayBuffer` も `FileWriter.write(blob)` .*

## ファイルを保存する場所

V1.2.0、現在重要なファイル システム ディレクトリへの Url を提供しています。 各 URL はフォーム*file:///path/to/spot/*に変換することができます、 `DirectoryEntry` を使用して`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-読み取り専用のディレクトリは、アプリケーションがインストールされています。（*iOS*、*アンドロイド*)

`cordova.file.applicationStorageDirectory`-アプリのプライベートの書き込み可能な記憶域のルートです。（*iOS*、*アンドロイド*)

`cordova.file.dataDirectory`-どこにアプリケーション固有のデータ ファイルを置きます。（*iOS*、*アンドロイド*)

`cordova.file.cacheDirectory`-キャッシュのファイルをアプリケーションの再起動後も維持する必要があります。アプリは、ここでファイルを削除する OS 依存しないでください。（*iOS*、*アンドロイド*)

`cordova.file.externalApplicationStorageDirectory`外部ストレージのアプリケーション領域。（*iOS*、*アンドロイド*)

`cordova.file.externalDataDirectory`-外部ストレージ上のアプリ固有のデータ ファイルを配置する場所。（*アンドロイド*)

`cordova.file.externalCacheDirectory`外部ストレージにアプリケーション キャッシュ。（*アンドロイド*)

`cordova.file.externalRootDirectory`-外部ストレージ (SD カード) ルート。（*アンドロイド*)

`cordova.file.tempDirectory`-OS をクリアすることができます temp ディレクトリが。(*iOS*)

`cordova.file.syncedDataDirectory`-（例えば iCloud) に同期する必要がありますアプリケーション固有のファイルを保持します。(*iOS*)

`cordova.file.documentsDirectory`-ファイル、アプリがプライベート他行われなくなります (Office ファイルなど） には意味が。(*iOS*)

## Android の癖

### Android の永続的なストレージの場所

Android のデバイスに永続的なファイルを格納する複数の有効な場所があります。 さまざまな可能性について広範な議論のための[このページ][4]を参照してください。

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

以前のバージョンのプラグインは、デバイスの SD カード （または同等のストレージ パーティション） マウントされていたと主張したかどうかに基づいて、起動時に一時と永続的なファイルの場所を選ぶでしょう。 SD カードがマウントされている場合、または大規模な内部ストレージ パーティションが利用可能な場合 (ようネクサス デバイス上） し、永続的なファイルは、その領域のルートに格納されます。 これはすべての Cordova アプリ見ることができる利用可能なファイルのすべてのカードに意味しました。

SD カードが利用できない場合、以前のバージョン取得データを保存/データ/データの下<packageid>、アプリ、互いからの分離がまだユーザー間で共有するデータを引き起こす可能性があります。

内部ファイルの保存場所やアプリケーションの config.xml ファイルに優先順位を持つ以前のロジックを使用してファイルを保存するかどうかを選択することが可能です今。 これを行うに、config.xml に次の 2 行のいずれかを追加します。

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

この行がなければファイル プラグインは既定値として「互換性」を使用します。優先タグが存在し、これらの値の 1 つではない場合、アプリケーションは起動しません。

アプリケーションは、ユーザーに以前出荷されている場合、古い (前 1.0） を使用して、このプラグインのバージョンし、永続的なファイルシステムに保存されているファイルには「互換性」を設定する必要があります。 自分のアプリケーションをアップグレードする既存のユーザーを彼らの装置によって、以前に保存されたファイルにアクセスすることができることがあることを意味する「内部」に場所をスイッチングします。

アプリケーション場合は、新しい、または永続的なファイルシステムにファイルが格納され以前は決して、「内部」の設定は推奨一般に。

## iOS の癖

*   `FileReader.readAsText(blob, encoding)` 
    *   `encoding`パラメーターはサポートされていませんし、utf-8 エンコーディングが常に有効です。

### iOS の永続的なストレージの場所

IOS デバイスに永続的なファイルを格納する 2 つの有効な場所がある: ドキュメントとライブラリのディレクトリ。 プラグインの以前のバージョンは、唯一のこれまでドキュメント ディレクトリに永続的なファイルを格納されます。 これは、ディレクトリの目的は、輸出のための完全なドキュメントを作成するのではなくなかったがしばしば意図されていたり、特に多数の小さいファイルを処理するアプリケーションの場合、iTunes に表示されているすべてのアプリケーションのファイルを作るの副作用があった。

ドキュメントまたはアプリケーションの config.xml ファイルに優先順位のライブラリ ディレクトリにファイルを保存するかどうかを選択することが可能です今。 これを行うに、config.xml に次の 2 行のいずれかを追加します。

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

この行がなければファイル プラグインは既定値として「互換性」を使用します。優先タグが存在し、これらの値の 1 つではない場合、アプリケーションは起動しません。

アプリケーションは、ユーザーに以前出荷されている場合、古い (前 1.0） を使用して、このプラグインのバージョンし、永続的なファイルシステムに保存されているファイルには「互換性」を設定する必要があります。 自分のアプリケーションをアップグレードする既存のユーザーを以前に保存されたファイルにアクセスすることができるだろうことを意味する「ライブラリ」に場所をスイッチングします。

アプリケーション場合は、新しい、または永続的なファイルシステムにファイルが格納され以前は決して、「ライブラリ」設定は推奨一般に。

### Firefox OS 癖

ファイル システム API Firefox OS でネイティブ サポートされていないと、indexedDB の上にシムとして実装されています。

*   空でないディレクトリを削除するときに失敗しません
*   ディレクトリのメタデータをサポートしていません
*   サポートしていない `requestAllFileSystems` と `resolveLocalFileSystemURI` 方法
*   方法 `copyTo` と `moveTo` ディレクトリをサポートしていません

## ノートをアップグレードします。

このプラグインのデベロッパーで、 `FileEntry` と `DirectoryEntry` 構造変更、公開された仕様に沿ったより多くであります。

プラグインの前 (pre 1.0.0) バージョン、デバイス-絶対-ファイルの場所に格納されている、 `fullPath` のプロパティ `Entry` オブジェクト。これらのパスはようになります通常

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

これらのパスはまたによって返された、 `toURL()` 法、 `Entry` オブジェクト。

デベロッパーと、 `fullPath` 属性は、 *HTML のファイルシステムのルートに対する相対パス*のファイルへのパス。 したがって、上記のパスは両方によって表される今、 `FileEntry` オブジェクトが、 `fullPath` の

    /path/to/file
    

場合は、アプリケーションはデバイス絶対パスで動作し、以前からそれらのパスを取得、 `fullPath` のプロパティ `Entry` を使用してコードを更新する必要があり、オブジェクト `entry.toURL()` 代わりに。

後方の互換性、 `resolveLocalFileSystemURL()` メソッドはデバイス絶対パスを受け入れるし、戻ります、 `Entry` 、一時的または永続的なファイル ・ システム内でそのファイルが存在する限り、それに対応するオブジェクト。

これは特に以前デバイス絶対パスを使用してファイル転送のプラグインで問題となっている （そしてまだそれらを受け入れることができます）。 ので交換、ファイルシステムの Url で正しく動作するように更新されている `entry.fullPath` と `entry.toURL()` デバイス上のファイルで動作するプラグインを得て問題を解決する必要があります。

V1.1.0 戻り値での `toURL()` が変更された (\[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394) を参照) を絶対的な 'file://' で始まる URL を返します。 可能な限り。 確保するために、' cdvfile:'-使用することができます URL `toInternalURL()` 今。 このメソッドは、フォームのファイルシステムの Url を返します今

    cdvfile://localhost/persistent/path/to/file
    

これはファイルを一意に識別するために使用できます。

## エラー コードと意味のリスト

エラーがスローされると、次のコードのいずれかが使用されます。

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

## (省略可能) プラグインを構成します。

利用可能なファイルシステムのセットは構成されたプラットフォームをすることができます。IOS と Android の両方を認識します。 <preference> タグの `config.xml` をインストールするファイルシステムの名前します。既定では、すべてのファイル システムのルートが有効になります。

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### アンドロイド

*   ファイル： アプリケーションの内部ファイルのストレージ ディレクトリ
*   外部ファイル: アプリケーションの外部のファイルのストレージ ディレクトリ
*   sd カード：、グローバル外部ストレージ ディレクトリをファイル (これは SD カードのルートがインストールされている場合)。 必要があります、 `android.permission.WRITE_EXTERNAL_STORAGE` これを使用するアクセス許可。
*   キャッシュ： アプリケーションの内部キャッシュ ディレクトリ
*   キャッシュ外部： 外部キャッシュのアプリケーションのディレクトリ
*   ルート： デバイス全体のファイルシステム

アンドロイドを「ファイル」ファイルシステム内の"ドキュメント/"サブディレクトリを表す"ドキュメント"という名前の特殊なファイルシステムもサポートしています。

### iOS

*   ライブラリ: ライブラリのアプリケーションのディレクトリ
*   ドキュメント: ドキュメントのアプリケーションのディレクトリ
*   キャッシュ: キャッシュのアプリケーションのディレクトリ
*   バンドル: アプリケーションバンドル;アプリ自体 (読み取りのみ) ディスク上の場所
*   ルート： デバイス全体のファイルシステム

既定では、ライブラリとドキュメント ディレクトリを iCloud に同期できます。 ライブラリまたはドキュメントのファイルシステム内の特別な非同期ディレクトリを表す 2 つの追加のファイルシステム、"ライブラリ nosync"、「ドキュメント nosync」を要求することもできます。