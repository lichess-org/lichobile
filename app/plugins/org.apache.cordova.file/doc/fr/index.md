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

Ce plugin fournit les [API de système de fichiers de HTML5][1]. Pour son utilisation, reportez-vous à l'HTML5 Rocks' [FileSystem article][2] sur le sujet. Pour un aperçu des autres options de stockage, consultez [guide d'entreposage de Cordova][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## Installation

    cordova plugin add org.apache.cordova.file
    

## Plates-formes prises en charge

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 et 8 *
*   Windows 8 *
*   Firefox OS

* *Ces plates-formes ne supportent pas `FileReader.readAsArrayBuffer` ni `FileWriter.write(blob)` .*

## Emplacement de stockage des fichiers

À partir de v1.2.0, URL vers des répertoires de système de fichiers importants est fournis. Chaque URL est dans la forme *file:///path/to/spot/*et peut être converti en un `DirectoryEntry` à l'aide`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-Lecture seule répertoire où l'application est installée. (*iOS*, *Android*)

`cordova.file.applicationStorageDirectory`-Racine de stockage accessible en écriture privé de l'application. (*iOS*, *Android*)

`cordova.file.dataDirectory`-Où placer les fichiers de données d'application spécifiques. (*iOS*, *Android*)

`cordova.file.cacheDirectory`-Mise en cache de fichiers qui doivent survivre app redémarre. Apps ne doivent pas compter sur le système d'exploitation pour supprimer les fichiers ici. (*iOS*, *Android*)

`cordova.file.externalApplicationStorageDirectory`-Espace l'application sur le stockage externe. (*iOS*, *Android*)

`cordova.file.externalDataDirectory`-Où placer les fichiers de données d'application spécifiques sur le stockage externe. (*Android*)

`cordova.file.externalCacheDirectory`-Cache de l'application sur le stockage externe. (*Android*)

`cordova.file.externalRootDirectory`-Racine de stockage externe (carte SD). (*Android*)

`cordova.file.tempDirectory`-Répertoire temp que l'OS peut effacer à volonté. (*iOS*)

`cordova.file.syncedDataDirectory`-Contient des fichiers d'app spécifique qui doivent se synchroniser (par exemple à iCloud). (*iOS*)

`cordova.file.documentsDirectory`-Fichiers privés à l'app, mais qui sont utiles à d'autres applications (par exemple les fichiers Office). (*iOS*)

## Quirks Android

### Emplacement de stockage persistant Android

Il y a plusieurs emplacements valides pour stocker des fichiers persistants sur un appareil Android. Voir [cette page][4] pour une analyse approfondie des diverses possibilités.

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

Les versions précédentes du plugin choisirait l'emplacement des fichiers temporaires et persistantes au démarrage, basé sur la question de savoir si le dispositif réclamé que la carte SD (ou une partition de stockage équivalent) a été montée. Si la carte SD a été montée, ou si une partition de stockage interne importante était disponible (comme sur les appareils Nexus,) puis les fichiers persistants seraient stockés dans la racine de cet espace. Cela signifie que toutes les apps de Cordova pouvaient voir tous les fichiers disponibles sur la carte.

Si la carte SD n'était pas disponible, alors les versions précédentes seraient stocker des données sous/données/data /<packageid>, qui isole les apps de l'autre, mais peuvent encore provoquer des données à partager entre les utilisateurs.

Il est maintenant possible de choisir de stocker les fichiers dans l'emplacement de stockage de fichier interne, ou en utilisant la logique précédente, avec une préférence dans le fichier config.xml de votre application. Pour ce faire, ajoutez l'un des ces deux lignes au fichier config.xml :

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

Sans cette ligne, le fichier plugin utilisera la valeur par défaut « Compatibilité ». Si une balise de préférence est présente et n'est pas une des valeurs suivantes, l'application ne démarrera pas.

Si votre application a déjà été expédiée aux utilisateurs, en utilisant une ancienne (avant 1.0) version de ce plugin et dispose des fichiers stockés dans le système de fichiers persistant, alors vous devez définir la préférence à la « Compatibilité ». Commutation de l'emplacement « Internal » signifierait que les utilisateurs existants qui mettre à niveau leur application peuvent être impossible d'accéder à leurs fichiers déjà enregistrés, selon leur appareil.

Si votre application est nouvelle ou a jamais précédemment stocké les fichiers dans le système de fichiers persistant, alors le paramètre « interne » est généralement recommandé.

## iOS Quirks

*   `FileReader.readAsText(blob, encoding)` 
    *   Le `encoding` paramètre n'est pas pris en charge, et le codage UTF-8 est toujours en vigueur.

### emplacement de stockage persistant d'iOS

Il y a deux emplacements valides pour stocker des fichiers persistants sur un appareil iOS : le répertoire de Documents et le répertoire de la bibliothèque. Les versions précédentes du plugin stockaient ne jamais fichiers persistants dans le répertoire de Documents. Cela a eu l'effet secondaire de rendre tous les fichiers de l'application visible dans iTunes, qui était souvent inattendus, en particulier pour les applications qui traitent beaucoup de petits fichiers, plutôt que de produire des documents complets destinés à l'exportation, qui est l'objectif visé par le répertoire.

Il est maintenant possible de choisir de stocker les fichiers dans le répertoire de bibliothèque, avec une préférence dans le fichier config.xml de votre application ou de documents. Pour ce faire, ajoutez l'un des ces deux lignes au fichier config.xml :

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

Sans cette ligne, le fichier plugin utilisera la valeur par défaut « Compatibilité ». Si une balise de préférence est présente et n'est pas une des valeurs suivantes, l'application ne démarrera pas.

Si votre application a déjà été expédiée aux utilisateurs, en utilisant une ancienne (avant 1.0) version de ce plugin et dispose des fichiers stockés dans le système de fichiers persistant, alors vous devez définir la préférence à la « Compatibilité ». L'emplacement de la « Bibliothèque » de commutation signifierait que les utilisateurs existants qui mettre à niveau leur application serait incapables d'accéder à leurs fichiers déjà enregistrés.

Si votre application est nouvelle ou a jamais précédemment stocké les fichiers dans le système de fichiers persistant, alors le paramètre « Library » est généralement recommandé.

### Firefox OS Quirks

L'API de système de fichier n'est pas nativement pris en charge par Firefox OS et est implémentée comme une cale d'épaisseur sur le dessus d'indexedDB.

*   Ne manque pas lors de la suppression des répertoires non vide
*   Ne supporte pas les métadonnées pour les répertoires
*   Ne prend pas en charge `requestAllFileSystems` et `resolveLocalFileSystemURI` méthodes
*   Méthodes `copyTo` et `moveTo` ne prennent pas en charge les répertoires

## Notes de mise à niveau

Dans v1.0.0 de ce plugin, la `FileEntry` et `DirectoryEntry` structures ont changé, pour être plus conforme à la spécification publiée.

Les versions précédentes de (pré-1.0.0) du plugin stockaient l'appareil-absolu-fichier-emplacement dans la `fullPath` propriété de `Entry` objets. Ces chemins seraient présente généralement comme

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

Ces chemins ont été également renvoyés par la `toURL()` méthode de la `Entry` des objets.

Avec v1.0.0, le `fullPath` attribut contient le chemin vers le fichier, *par rapport à la racine du système de fichiers HTML*. Ainsi, les chemins d'accès ci-dessus seraient maintenant tous les deux être représenté par un `FileEntry` d'objet avec un `fullPath` de

    /path/to/file
    

Si votre application fonctionne avec le dispositif-absolu-chemins, et que vous avez récupéré précédemment ces chemins à travers la `fullPath` propriété de `Entry` objets, puis vous devez mettre à jour votre code d'utiliser `entry.toURL()` à la place.

Pour vers l'arrière compatibilité, la `resolveLocalFileSystemURL()` méthode acceptera un chemin absolu de l'unité et retournera un `Entry` objet correspond, tant que ce fichier existe au sein des systèmes de fichiers temporaires ou permanents.

Cela a été particulièrement un problème avec le plugin de transfert de fichiers, qui autrefois périphérique-absolu-chemins (et peut encore accepter). Il a été mis à jour pour fonctionner correctement avec des URL de système de fichiers, remplaçant ainsi `entry.fullPath` avec `entry.toURL()` devrait résoudre tout problème obtenir ce plugin pour travailler avec des fichiers sur le périphérique.

Dans v1.1.0 la valeur de retour de `toURL()` a été changé (voir \[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394)) pour renvoyer une URL absolue « file:// ». dans la mesure du possible. Pour assurer un ' cdvfile:'-URL, vous pouvez utiliser `toInternalURL()` maintenant. Cette méthode retourne maintenant filesystem URL du formulaire

    cdvfile://localhost/persistent/path/to/file
    

qui peut servir à identifier de manière unique le fichier.

## Liste des Codes d'erreur et leur signification

Lorsqu'une erreur est levée, l'un des codes suivants sera utilisé.

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

## Configuration du Plugin (facultatif)

L'ensemble des systèmes de fichiers disponibles peut être configurée par plate-forme. Les iOS et Android reconnaissent une <preference> tag dans `config.xml` qui désigne les systèmes de fichiers à installer. Par défaut, toutes les racines du système de fichiers sont activées.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android

*   fichiers : répertoire de stockage de fichier interne de l'application
*   fichiers externes : répertoire de l'application de stockage de fichier externe
*   carte SD : le répertoire de stockage global fichier externe (c'est la racine de la carte SD, s'il est installé). Vous devez avoir la `android.permission.WRITE_EXTERNAL_STORAGE` permission de l'utiliser.
*   cache : répertoire de cache interne de l'application
*   cache-externe : répertoire de cache externe de l'application
*   racine : le système de fichiers de tout dispositif

Android prend également en charge un système de fichiers spécial nommé « documents », qui représente un sous-répertoire « / Documents / » dans le système de fichiers « files ».

### iOS

*   Bibliothèque : répertoire de bibliothèque de l'application
*   documents : répertoire de Documents de l'application
*   cache : répertoire de Cache de l'application
*   Bundle : bundle de l'application ; l'emplacement de l'application elle-même sur disque (lecture seule)
*   racine : le système de fichiers de tout dispositif

Par défaut, vous peuvent synchroniser les répertoires de la bibliothèque et les documents à iCloud. Vous pouvez également demander des deux systèmes de fichiers supplémentaires, « bibliothèque-nosync » et « documents-nosync », qui représentent un répertoire spécial non synchronisées dans le système de fichiers de bibliothèque ou de Documents.