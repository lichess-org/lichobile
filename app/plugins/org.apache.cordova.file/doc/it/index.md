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

Questo plugin fornisce le [API di HTML5 Filesystem][1]. Per l'utilizzo, fare riferimento all' [FileSystem articolo][2] sull'argomento HTML5 Rocks'. Per una panoramica delle altre opzioni di archiviazione, consultare [Guida di archiviazione di Cordova][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## Installazione

    cordova plugin add org.apache.cordova.file
    

## Piattaforme supportate

*   Amazon fuoco OS
*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 e 8 *
*   Windows 8 *
*   Firefox OS

* *Non supportano queste piattaforme `FileReader.readAsArrayBuffer` né `FileWriter.write(blob)` .*

## Dove memorizzare i file

A partire dalla v 1.2.0, vengono forniti gli URL per le directory importanti file di sistema. Ogni URL è nella forma *file:///path/to/spot/*e può essere convertito in un `DirectoryEntry` utilizzando`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-Sola lettura directory dove è installato l'applicazione. (*iOS*, *Android*)

`cordova.file.applicationStorageDirectory`-Radice di ammasso scrivibile privato dell'app. (*iOS*, *Android*)

`cordova.file.dataDirectory`-Dove mettere i file di dati specifici di app. (*iOS*, *Android*)

`cordova.file.cacheDirectory`-I file che dovrebbero sopravvivere si riavvia app nella cache. Apps non devono basarsi sull'OS di eliminare i file qui. (*iOS*, *Android*)

`cordova.file.externalApplicationStorageDirectory`-Spazio applicazione su storage esterno. (*iOS*, *Android*)

`cordova.file.externalDataDirectory`-Dove mettere i file di dati specifico app su storage esterno. (*Android*)

`cordova.file.externalCacheDirectory`-Cache applicazione su storage esterno. (*Android*)

`cordova.file.externalRootDirectory`-Radice di archiviazione esterna (scheda SD). (*Android*)

`cordova.file.tempDirectory`-Temp directory che l'OS è possibile cancellare a volontà. (*iOS*)

`cordova.file.syncedDataDirectory`-Contiene i file app specifiche che devono essere sincronizzati (per esempio a iCloud). (*iOS*)

`cordova.file.documentsDirectory`-I file privati per le app, ma che sono significativi per altri nonché (ad es. file di Office). (*iOS*)

## Stranezze Android

### Posizione di archiviazione persistente Android

Ci sono più percorsi validi per memorizzare i file persistenti su un dispositivo Android. Vedi [questa pagina][4] per un'ampia discussione delle varie possibilità.

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

Versioni precedenti del plugin avrebbe scelto il percorso dei file temporanei e permanenti su avvio, in base se il dispositivo ha sostenuto che la scheda SD (o partizione storage equivalente) è stato montato. Se è stata montata sulla scheda SD o una partizione di storage interno grande era disponibile (come sui dispositivi Nexus,) allora saranno memorizzati i file persistenti nella radice di quello spazio. Questo significava che tutte le apps di Cordova poteva vedere tutti i file disponibili sulla carta.

Se la scheda SD non era disponibile, versioni precedenti vuoi memorizzare dati sotto /dati/dati /<packageid>, che isola i apps da altro, ma possono ancora causare dati da condividere tra gli utenti.

Ora è possibile scegliere se memorizzare i file nel percorso di archiviazione di file interno o utilizzando la logica precedente, con una preferenza nel file config. XML dell'applicazione. Per fare questo, aggiungere una di queste due linee al file config. xml:

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

Senza questa linea, il File del plugin utilizzerà "Compatibilità" come predefinito. Se è presente un tag di preferenza e non è uno di questi valori, l'applicazione non si avvia.

Se l'applicazione è stato spedito in precedenza agli utenti, utilizzando un vecchio (pre-1.0) versione di questo plugin e ha i file memorizzati nel filesystem persistente, allora si dovrebbe impostare la preferenza alla "Compatibilità". La posizione su "Interno" di commutazione significherebbe che gli utenti esistenti che aggiornare la loro applicazione potrebbero essere Impossibile accedere ai loro file precedentemente memorizzati, a seconda del loro dispositivo.

Se l'applicazione è nuova, o ha mai precedentemente memorizzati i file nel filesystem persistente, è generalmente consigliato l'impostazione "interno".

## iOS stranezze

*   `FileReader.readAsText(blob, encoding)` 
    *   Il `encoding` parametro non è supportato, e codifica UTF-8 è sempre attivo.

### posizione di archiviazione persistente di iOS

Ci sono due percorsi validi per memorizzare i file persistenti su un dispositivo iOS: la directory documenti e la biblioteca. Precedenti versioni del plugin archiviati solo mai persistenti file nella directory documenti. Questo ha avuto l'effetto collaterale di tutti i file di un'applicazione che rende visibili in iTunes, che era spesso involontaria, soprattutto per le applicazioni che gestiscono un sacco di piccoli file, piuttosto che produrre documenti completi per l'esportazione, che è la destinazione della directory.

Ora è possibile scegliere se memorizzare i file nella directory di libreria, con una preferenza nel file config. XML dell'applicazione o documenti. Per fare questo, aggiungere una di queste due linee al file config. xml:

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

Senza questa linea, il File del plugin utilizzerà "Compatibilità" come predefinito. Se è presente un tag di preferenza e non è uno di questi valori, l'applicazione non si avvia.

Se l'applicazione è stato spedito in precedenza agli utenti, utilizzando un vecchio (pre-1.0) versione di questo plugin e ha i file memorizzati nel filesystem persistente, allora si dovrebbe impostare la preferenza alla "Compatibilità". La posizione di "Libreria" di commutazione significherebbe che gli utenti esistenti che aggiornare la loro applicazione è in grado di accedere ai loro file precedentemente memorizzati.

Se l'applicazione è nuova, o ha mai precedentemente memorizzati i file nel filesystem persistente, è generalmente consigliato l'impostazione "Libreria".

### Firefox OS stranezze

L'API di sistema del File non è supportato nativamente dal sistema operativo Firefox e viene implementato come uno spessore in cima indexedDB.

*   Non manca quando si rimuove le directory non vuota
*   Non supporta i metadati per le directory
*   Non supporta `requestAllFileSystems` e `resolveLocalFileSystemURI` metodi
*   Metodi `copyTo` e `moveTo` non supporta le directory

## Note di aggiornamento

In v 1.0.0 di questo plugin, il `FileEntry` e `DirectoryEntry` strutture sono cambiati, per essere più in linea con le specifiche pubblicate.

Versioni precedenti (pre-1.0.0) del plugin archiviati il dispositivo-assoluto--percorso del file nella `fullPath` proprietà di `Entry` oggetti. In genere questi percorsi si sarebbe simile

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

Questi percorsi sono stati restituiti anche dal `toURL()` metodo della `Entry` oggetti.

Con v 1.0.0, la `fullPath` attributo è il percorso del file, *rispetto alla radice del filesystem HTML*. Così, i percorsi sopra sarebbe ora sia rappresentato da un `FileEntry` oggetto con un `fullPath` di

    /path/to/file
    

Se l'applicazione funziona con dispositivo-assoluto-percorsi, e estratto in precedenza tali percorsi attraverso la `fullPath` proprietà di `Entry` oggetti, allora si dovrebbe aggiornare il codice per utilizzare `entry.toURL()` invece.

Per indietro compatibilità, il `resolveLocalFileSystemURL()` Metodo accetterà un dispositivo-assoluto-percorso e restituirà un `Entry` oggetto corrispondente ad essa, fintanto che il file esiste all'interno del filesystem temporaneo o permanente.

Questo particolare è stato un problema con il plugin di trasferimento File, che in precedenza utilizzati percorsi-dispositivo-assoluto (e ancora può accoglierli). Esso è stato aggiornato per funzionare correttamente con gli URL di FileSystem, così sostituendo `entry.fullPath` con `entry.toURL()` dovrebbe risolvere eventuali problemi ottenendo quel plugin per lavorare con i file nel dispositivo.

In v. 1.1.0 il valore restituito di `toURL()` è stato cambiato (vedere \[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394)) per restituire un URL assoluto 'file://'. ove possibile. Per assicurare un ' cdvfile:'-URL, è possibile utilizzare `toInternalURL()` ora. Questo metodo restituirà ora filesystem URL del modulo

    cdvfile://localhost/persistent/path/to/file
    

che può essere utilizzato per identificare univocamente il file.

## Elenco dei codici di errore e significati

Quando viene generato un errore, uno dei seguenti codici da utilizzare.

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

## Configurare il Plugin (opzionale)

Il set di filesystem disponibili può essere configurato per ogni piattaforma. Sia iOS che Android riconoscere un <preference> taggare in `config.xml` che denomina il filesystem per essere installato. Per impostazione predefinita, tutte le radici del file system sono abilitate.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android

*   File: directory di archiviazione di file interno dell'applicazione
*   file-esterno: directory di archiviazione dell'applicazione file esterno
*   sdcard: la directory di archiviazione di file esterni globale (questa è la radice della scheda SD, se uno è installato). Deve avere il `android.permission.WRITE_EXTERNAL_STORAGE` il permesso di usare questo.
*   cache: la cache interna directory applicazione
*   cache-esterno: directory di cache esterna dell'applicazione
*   radice: il dispositivo intero filesystem

Android supporta anche un filesystem speciale denominato "documenti", che rappresenta una sottodirectory "/ documenti /" all'interno del filesystem "files".

### iOS

*   Biblioteca: la directory dell'applicazione libreria
*   documenti: la directory dell'applicazione documenti
*   cache: la Cache directory applicazione
*   bundle: bundle dell'applicazione; la posizione dell'app sul disco (sola lettura)
*   radice: il dispositivo intero filesystem

Per impostazione predefinita, la directory di libreria e documenti può essere sincronizzata a iCloud. È anche possibile richiedere due filesystem aggiuntivi, "biblioteca-nosync" e "documenti-nosync", che rappresentano una speciale directory non sincronizzati entro il filesystem libreria o documenti.