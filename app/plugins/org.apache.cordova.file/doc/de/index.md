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

Dieses Plugin bietet die [HTML5-Dateisystem-API][1]. Verwendung finden Sie unter HTML5 Rocks [FileSystem-Artikel][2] zu diesem Thema. Finden Sie einen Überblick über andere Speicheroptionen Cordovas [Speicher-Führer][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## Installation

    cordova plugin add org.apache.cordova.file
    

## Unterstützte Plattformen

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 und 8 *
*   Windows 8 *
*   Firefox OS

* *Diese Plattformen unterstützen nicht `FileReader.readAsArrayBuffer` noch `FileWriter.write(blob)` .*

## Wo Dateien gespeichert

Stand: V1 werden URLs auf wichtige Datei-System-Verzeichnisse zur Verfügung gestellt. Jede URL in der Form *file:///path/to/spot/*ist, und konvertiert werden können eine `DirectoryEntry` mit`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-Die schreibgeschützten Verzeichnis, in dem die Anwendung installiert ist. (*iOS*, *Android*)

`cordova.file.applicationStorageDirectory`-Stamm der app's private beschreibbaren Speicher. (*iOS*, *Android*)

`cordova.file.dataDirectory`-Wo app-spezifische Datendateien zu setzen. (*iOS*, *Android*)

`cordova.file.cacheDirectory`-Cache-Dateien, die app startet überleben sollte. Apps sollten nicht vom Betriebssystem zum Löschen von Dateien hier verlassen. (*iOS*, *Android*)

`cordova.file.externalApplicationStorageDirectory`-Anwendungsraum auf externen Speicher. (*iOS*, *Android*)

`cordova.file.externalDataDirectory`-Wo, app-spezifische Datendateien auf externen Speicher setzen. (*Android*)

`cordova.file.externalCacheDirectory`-Anwendungscache auf externen Speicher. (*Android*)

`cordova.file.externalRootDirectory`-Externer Speicher (SD-Karte) Stamm. (*Android*)

`cordova.file.tempDirectory`-Temp-Verzeichnis, dem das OS auf deaktivieren können wird. (*iOS*)

`cordova.file.syncedDataDirectory`-Hält app-spezifische Dateien, die (z. B. auf iCloud) synchronisiert werden sollten. (*iOS*)

`cordova.file.documentsDirectory`-Dateien für die app, aber privat sind sinnvoll, andere Anwendungen (z.B. Office-Dateien). (*iOS*)

## Android Macken

### Android permanenten Speicherort

Es gibt mehrere gültige Speicherorte, persistente Dateien auf einem Android-Gerät zu speichern. Finden Sie auf [dieser Seite][4] eine ausführliche Diskussion über die verschiedenen Möglichkeiten.

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

Frühere Versionen des Plugins wählen würde, den Speicherort der temporären und permanenten Dateien beim Start, basierend auf, ob das Gerät behauptete, dass die SD-Karte (oder gleichwertige Speicherpartition) bereitgestellt wurde. Wenn die SD-Karte eingelegt wurde, oder wenn eine große interne Speicherpartition verfügbar war (wie auf Nexus-Geräten) und dann in die Wurzel dieses Raumes, die persistenten Dateien gespeichert werden. Dies bedeutete, dass alle Cordova apps aller verfügbaren Dateien auf der Karte sehen konnte.

Wenn die SD-Karte nicht verfügbar war, würde dann frühere Versionen unter/Data/Data/Datenspeicher<packageid>, die apps von einander isoliert, kann aber noch Daten für Benutzer freigegeben werden.

Es ist jetzt möglich, ob Sie Dateien der internen Datei-Speicherort oder unter Verwendung der bisherigen Logik, mit einer Präferenz in der Anwendung-config.xml-Datei speichern möchten. Hierzu fügen Sie eine dieser zwei Zeilen zu "config.xml":

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

Ohne diese Zeile wird die Datei-Erweiterung "Kompatibilität" als Standard verwenden. Wenn ein Präferenz-Tag vorhanden ist, und nicht einen der folgenden Werte, wird die Anwendung nicht gestartet.

Wenn Ihre Anwendung für Benutzer zuvor versandt wird, mithilfe eines älteren (Pre-1.0) Version dieses Plugins und gespeicherte Dateien im permanenten Dateisystem hat, dann setzen Sie die Einstellung auf "Kompatibilität". Wechseln die Location auf "Internal" würde bedeuten, dass Benutzer, die aktualisieren Sie ihre Anwendung, möglicherweise nicht auf ihre zuvor gespeicherte Dateien, abhängig von ihrem Gerät zugreifen.

Wenn Ihre Anwendung neu ist, oder nie zuvor Dateien im Dateisystem persistent gespeichert hat, wird die "interne" Einstellung im Allgemeinen empfohlen.

## iOS Macken

*   `FileReader.readAsText(blob, encoding)` 
    *   Die `encoding` Parameter wird nicht unterstützt und UTF-8-Kodierung ist immer wirksam.

### iOS permanenten Speicherort

Es gibt zwei gültige Speicherorte persistente Dateien auf ein iOS-Gerät speichern: das Dokumenten-Verzeichnis und das Verzeichnis Library. Frühere Versionen des Plugins gespeichert immer nur persistente Dateien im Verzeichnis Dokumente. Dies hatte den Nebeneffekt einer Anwendung Dateien in iTunes, die oft unbeabsichtigte, speziell für Anwendungen, die viele kleine Dateien behandeln war, sichtbar zu machen, anstatt komplette Dokumente für den Export, die den beabsichtigten Zweck des Verzeichnisses ist zu produzieren.

Es ist jetzt möglich, ob Sie Dateien in Dokumente oder Verzeichnis Library mit einer Präferenz in der Anwendung-config.xml-Datei speichern möchten. Hierzu fügen Sie eine dieser zwei Zeilen zu "config.xml":

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

Ohne diese Zeile wird die Datei-Erweiterung "Kompatibilität" als Standard verwenden. Wenn ein Präferenz-Tag vorhanden ist, und nicht einen der folgenden Werte, wird die Anwendung nicht gestartet.

Wenn Ihre Anwendung für Benutzer zuvor versandt wird, mithilfe eines älteren (Pre-1.0) Version dieses Plugins und gespeicherte Dateien im permanenten Dateisystem hat, dann setzen Sie die Einstellung auf "Kompatibilität". Wechseln zu "Library" Position würde bedeuten, dass Benutzer, die ihre Anwendung aktualisieren nicht in der Lage wäre, ihre zuvor gespeicherte Dateien zugreifen.

Wenn die Anwendung neu, oder nie zuvor Dateien im Dateisystem persistent gespeichert hat, wird die Einstellung "Bibliothek" empfohlen.

### Firefox OS Macken

Der Datei-System-API wird von Firefox-OS nicht nativ unterstützt und wird als ein Shim auf IndexedDB implementiert.

*   Schlägt nicht fehl, wenn Sie nicht leere Verzeichnisse entfernen
*   Metadaten wird für Verzeichnisse nicht unterstützt.
*   Bietet keine Unterstützung für `requestAllFileSystems` und `resolveLocalFileSystemURI` Methoden
*   Methoden `copyTo` und `moveTo` unterstützen keine Verzeichnisse

## Upgrade Notes

In v1.0.0 des Plugins die `FileEntry` und `DirectoryEntry` Strukturen haben sich geändert, um mehr im Einklang mit der veröffentlichten Spezifikation zu sein.

Vorgängerversionen (Pre-1.0.0) des Plugins gespeichert den Gerät-Absolute-Dateispeicherort in der `fullPath` -Eigenschaft der `Entry` Objekte. Diese Pfade würde in der Regel aussehen

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

Diese Pfade wurden auch zurückgegeben, indem die `toURL()` -Methode des der `Entry` Objekte.

Mit v1.0.0 das `fullPath` -Attribut ist der Pfad zu der Datei, *relativ zum Stammverzeichnis des Dateisystems HTML*. Also die oben genannten Pfade würden jetzt beide durch dargestellt werden ein `FileEntry` -Objekt mit einer `fullPath` von

    /path/to/file
    

Wenn Ihre Anwendung mit absoluter Gerätepfade arbeitet und Sie zuvor diese Pfade durch abgerufenen die `fullPath` -Eigenschaft des `Entry` Objekte, dann Sie Ihren Code mithilfe von update sollte `entry.toURL()` statt.

Für rückwärts Kompatibilität, die `resolveLocalFileSystemURL()` -Methode akzeptiert einen Absolute-Gerätepfad und kehren ein `Entry` -Objekt entspricht, solange diese Datei innerhalb von vorübergehenden oder dauerhaften Dateisysteme existiert.

Dies wurde vor allem ein Problem mit dem File-Transfer-Plugin, die zuvor-Absolute-Gerätepfade verwendet (und kann damit noch einverstanden). Es wurde aktualisiert, um ordnungsgemäß mit Dateisystem-URLs, so anstelle `entry.fullPath` mit `entry.toURL()` sollte lösen Sie alle Probleme, die immer des Plugin zum Arbeiten mit Dateien auf dem Gerät.

In v1.1.0 der Rückgabewert der `toURL()` wurde geändert (siehe \[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394)), um eine absolute "file://" URL zurückgeben. wo immer möglich. Sicherstellung einer ' Cdvfile:'-URL Sie können `toInternalURL()` jetzt. Diese Methode gibt jetzt Dateisystem URLs der Form zurück.

    cdvfile://localhost/persistent/path/to/file
    

die benutzt werden können, um die Datei eindeutig zu identifizieren.

## Liste der Fehlercodes und Bedeutungen

Wenn ein Fehler ausgelöst wird, wird eines der folgenden Codes verwendet werden.

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

## Konfigurieren das Plugin (Optional)

Die Menge der verfügbaren Dateisysteme kann pro Plattform konfiguriert sein. Erkennen von iOS und Android ein <preference> -Tag im `config.xml` die Namen der Dateisysteme installiert werden. Standardmäßig sind alle Datei-System-Roots aktiviert.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android

*   Dateien: interne Datei-Speicher-Verzeichnis der Anwendung
*   Dateien-extern: Verzeichnis der Anwendung externe Datei Speicher
*   Sdcard: das externe Globaldatei-Speicherverzeichnis (Dies ist die Wurzel der SD-Karte, sofern installiert). Sie müssen die `android.permission.WRITE_EXTERNAL_STORAGE` Erlaubnis, diese zu verwenden.
*   Cache: internen Cache-Verzeichnis der Anwendung
*   Cache-extern: externer Cache-Verzeichnis der Anwendung
*   Wurzel: das gesamte Gerät-Dateisystem

Android unterstützt auch eine spezielle Dateisystem mit dem Namen "Dokumente", die ein Unterverzeichnis "/ Dokumente /" die "Dateien" Dateisystem darstellt.

### iOS

*   Bibliothek: Bibliothek-Verzeichnis der Anwendung
*   Dokumente: Dokumente-Verzeichnis der Anwendung
*   Cache: Cache-Verzeichnis der Anwendung
*   Bundle: die Anwendung Bündel; den Speicherort der die app selbst auf dem Datenträger (schreibgeschützt)
*   Wurzel: das gesamte Gerät-Dateisystem

Standardmäßig können die Bibliothek und Dokumenten-Verzeichnisse mit iCloud synchronisiert werden. Sie können auch beantragen, zwei zusätzliche Dateisysteme, "Bibliothek-Nosync" und "Dokumente-Nosync", die einem speziellen nicht synchronisierten Verzeichnis im Dateisystem Bibliothek oder Dokumente darstellen.