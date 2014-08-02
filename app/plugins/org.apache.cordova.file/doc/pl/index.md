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

Plugin daje [HTML5 API systemu plików][1]. Za zwyczaj odnoszą się do skały HTML5 [plików artykuł][2] na ten temat. Omówienie innych opcji przechowywania odnoszą się do Cordova z [magazynu przewodnik][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## Instalacji

    cordova plugin add org.apache.cordova.file
    

## Obsługiwane platformy

*   Amazon ogień OS
*   Android
*   Jeżyna 10
*   iOS
*   Windows Phone 7 i 8 *
*   Windows 8 *
*   Firefox OS

* *Nie obsługują te platformy `FileReader.readAsArrayBuffer` , ani `FileWriter.write(blob)` .*

## Gdzie przechowywać pliki

Od v1.2.0 znajdują się adresy URL do katalogów ważne systemu plików. Każdy adres URL jest w formie *file:///path/to/spot/*i mogą być konwertowane na `DirectoryEntry` za pomocą`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-Tylko do odczytu katalogu gdzie jest zainstalowana aplikacja. (*iOS*, *Android*)

`cordova.file.applicationStorageDirectory`-Pierwiastek z prywatnego składowania zapisu aplikacji. (*iOS*, *Android*)

`cordova.file.dataDirectory`-Gdzie umieścić pliki dane specyficzne dla aplikacji. (*iOS*, *Android*)

`cordova.file.cacheDirectory`-W pamięci podręcznej plików, które powinny przetrwać aplikacja zostanie ponownie uruchomiony. Aplikacje nie powinny polegać na OS, aby usunąć pliki tutaj. (*iOS*, *Android*)

`cordova.file.externalApplicationStorageDirectory`-Stosowania przestrzeni na zewnętrznej pamięci masowej. (*iOS*, *Android*)

`cordova.file.externalDataDirectory`-Gdzie umieścić pliki danych specyficznych dla aplikacji na zewnętrznej pamięci masowej. (*Android*)

`cordova.file.externalCacheDirectory`-Pamięci podręcznej aplikacji na zewnętrznej pamięci masowej. (*Android*)

`cordova.file.externalRootDirectory`-Korzeń zewnętrznej pamięci masowej (karty SD). (*Android*)

`cordova.file.tempDirectory`-Temp katalogu systemu operacyjnego można wyczyścić w będzie. (*iOS*)

`cordova.file.syncedDataDirectory`-Posiada pliki specyficzne dla aplikacji, które powinny być zsynchronizowane (np. do iCloud). (*iOS*)

`cordova.file.documentsDirectory`-Pliki prywatne do aplikacji, ale że są znaczące dla innych applciations (np. plików pakietu Office). (*iOS*)

## Android dziwactwa

### Lokalizacja przechowywania trwałych Android

Istnieje wiele prawidłowe lokalizacje do przechowywania trwałych plików na telefonie z systemem Android. Zobacz [tę stronę][4] do szerokiej dyskusji o różnych możliwościach.

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

Poprzednie wersje pluginu wybrać lokalizację plików tymczasowych i trwałe podczas uruchamiania, czy urządzenie twierdził, że karta SD (lub równoważne magazynowanie podzia³) był montowany w oparciu. Czy karta SD została zamontowana, czy duży wewnętrzny magazynowanie podzia³ był dostępny (takie jak na Nexus urządzenia,) a następnie trwałe pliki będą przechowywane w katalogu głównego tego miejsca. Oznaczało to, że wszystkie aplikacje Cordova może Zobacz wszystkie pliki dostępne na karcie.

Jeśli karta SD nie był dostępny, poprzednie wersje będzie przechowywać dane w /data/danych /<packageid>, która izoluje aplikacje od siebie, ale nadal może spowodować danych, które mają być współużytkowane przez użytkowników.

Teraz jest możliwe, aby zdecydować, czy do przechowywania plików w lokalizacji magazynu plików, lub przy użyciu poprzednich logiki, z preferencją w aplikacji w pliku config.xml. Aby to zrobić, Dodaj jedną z tych dwóch linii do pliku config.xml:

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

Bez tej linii wtyczki pliku będzie używać "Zgodność" jako domyślny. Jeśli znacznik preferencji jest obecny i to nie jedną z tych wartości, aplikacja nie zostanie uruchomiona.

Jeśli aplikacja wcześniej zostało wysłane do użytkowników, przy użyciu starszych (pre-1.0) wersję tego pluginu i ma zapisane na dysku pliki w trwałych plików, a następnie należy ustawić preferencje "Zgodności". Przełączania lokalizacji do "Wewnętrznego" oznacza, że istniejących użytkowników, którzy ich aplikacja może być niesłabnący wobec dostęp ich wcześniej zapisane pliki, w zależności od ich urządzenie.

Jeśli aplikacja jest nowy, lub ma nigdy wcześniej przechowywane pliki w systemie plików trwałe, ustawienie "wewnętrznego" Generalnie jest zalecane.

## iOS dziwactwa

*   `FileReader.readAsText(blob, encoding)` 
    *   `encoding`Parametr nie jest obsługiwana, i kodowanie UTF-8 jest zawsze w efekcie.

### iOS lokalizacja przechowywania trwałych

Istnieją dwa ważne miejsca trwałe pliki na urządzenia iOS: katalogu dokumentów i katalogu biblioteki. Poprzednie wersje pluginu tylko kiedykolwiek przechowywane trwałe pliki w katalogu dokumentów. To miał ten efekt uboczny od rozpoznawalności wszystkie pliki aplikacji w iTunes, który był często niezamierzone, zwłaszcza dla aplikacji, które obsługują wiele małych plików, zamiast produkuje kompletne dokumenty do wywozu, który jest przeznaczenie katalogu.

Teraz jest możliwe, aby zdecydować, czy do przechowywania plików w dokumentach lub katalogu biblioteki, z preferencją w pliku config.xml aplikacji. Aby to zrobić, Dodaj jedną z tych dwóch linii do pliku config.xml:

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

Bez tej linii wtyczki pliku będzie używać "Zgodność" jako domyślny. Jeśli znacznik preferencji jest obecny i to nie jedną z tych wartości, aplikacja nie zostanie uruchomiona.

Jeśli aplikacja wcześniej zostało wysłane do użytkowników, przy użyciu starszych (pre-1.0) wersję tego pluginu i ma zapisane na dysku pliki w trwałych plików, a następnie należy ustawić preferencje "Zgodności". Przełączania lokalizacji "Biblioteki" oznacza, że istniejących użytkowników, którzy ich aplikacja będzie niesłabnący wobec dostęp ich wcześniej zapisane pliki.

Jeśli aplikacja jest nowy, lub ma nigdy wcześniej przechowywane pliki w systemie plików trwałe, ustawienie "Biblioteki" Generalnie jest zalecane.

### Firefox OS dziwactwa

API systemu plików nie jest obsługiwany macierzyście przez Firefox OS i jest zaimplementowany jako podkładki na indexedDB.

*   Nie usuwając niepuste katalogi
*   Nie obsługuje metadane dla katalogów
*   Nie obsługuje `requestAllFileSystems` i `resolveLocalFileSystemURI` metody
*   Metody `copyTo` i `moveTo` nie obsługuje katalogi

## Uaktualniania notatek

W v1.0.0 ten plugin `FileEntry` i `DirectoryEntry` struktur zmieniły się, aby być bardziej zgodnie z opublikowaną specyfikacją.

Poprzednie wersje (pre-1.0.0) plugin przechowywane urządzenia bezwzględna plik lokalizacja w `fullPath` Właściwość `Entry` obiektów. Te ścieżki zazwyczaj będzie wyglądać

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

Te ścieżki również zostały zwrócone przez `toURL()` Metoda `Entry` obiektów.

Z v1.0.0 `fullPath` atrybut jest ścieżką do pliku, *względem katalogu głównego systemu plików HTML*. Tak, powyżej ścieżki będzie teraz zarówno reprezentowana przez `FileEntry` obiekt z `fullPath` z

    /path/to/file
    

Jeśli aplikacja działa z ścieżki bezwzględnej urządzeń, i możesz wcześniej źródło tych ścieżek za pomocą `fullPath` Właściwość `Entry` obiektów, a następnie należy zaktualizować kod, aby użyć `entry.toURL()` zamiast.

Do tyłu zgodności, `resolveLocalFileSystemURL()` Metoda akceptuje pomysł ścieżka bezwzględna i zwróci `Entry` obiektu odpowiadającego mu, tak długo, jak ten plik istnieje w tymczasowe lub trwałe systemy plików.

To szczególnie został problem z pluginem transferu plików, które poprzednio używane ścieżki bezwzględnej urządzeń (i wciąż można je przyjąć). To został zaktualizowany, aby działać poprawnie z adresów URL plików, więc wymiana `entry.fullPath` z `entry.toURL()` powinno rozwiązać wszelkie problemy dostawanie ten plugin do pracy z plików w pamięci urządzenia.

W v1.1.0 wartość zwracana z `toURL()` został zmieniony (patrz \[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394)) zwraca adres URL absolutnej "file://". wszędzie tam, gdzie jest to możliwe. Aby zapewnić ' cdvfile:'-URL można użyć `toInternalURL()` teraz. Ta metoda zwróci teraz adresy URL plików formularza

    cdvfile://localhost/persistent/path/to/file
    

który służy do jednoznacznej identyfikacji pliku.

## Wykaz kodów błędów i ich znaczenie

Gdy błąd jest generowany, jeden z następujących kodów będzie służyć.

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

## Konfigurowanie wtyczka (opcjonalny)

Zestaw dostępnych plików może być skonfigurowany na platformie. Zarówno iOS i Android <preference> uchwyt w `config.xml` które nazwy plików do instalacji. Domyślnie włączone są wszystkie korzenie systemu plików.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android

*   pliki: katalogu przechowywania plików aplikacji
*   zewnętrzne pliki: katalog aplikacji zewnętrznych plików
*   sdcard: katalog globalny plik zewnętrzny (to jest głównym karty SD, jeśli jedna jest zainstalowana). Musisz mieć `android.permission.WRITE_EXTERNAL_STORAGE` uprawnienie do korzystania z tego.
*   pamięć podręczna: katalogu wewnętrznej pamięci podręcznej aplikacji
*   pamięci podręcznej zewnętrzne: katalogu aplikacji zewnętrznych pamięci podręcznej
*   korzeń: całe urządzenie systemu plików

Android obsługuje również specjalnych plików o nazwie "dokumenty", który reprezentuje podkatalog "/ dokumenty /" w ramach systemu plików "pliki".

### iOS

*   Biblioteka: katalog biblioteki aplikacji
*   dokumenty: dokumenty katalogu aplikacji
*   pamięć podręczna: katalogu pamięci podręcznej aplikacji
*   pakiet: pakiet aplikacji; Lokalizacja aplikacji na dysku (tylko do odczytu)
*   korzeń: całe urządzenie systemu plików

Domyślnie katalogi biblioteki i dokumenty mogą być synchronizowane iCloud. Można również zażądać dwóch dodatkowych plików, "biblioteka nosync" i "dokumenty nosync", które stanowią specjalny katalog nie zsynchronizowane w bibliotece lub dokumentów systemu plików.