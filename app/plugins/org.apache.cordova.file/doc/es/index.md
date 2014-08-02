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

Este plugin proporciona la [API del sistema de ficheros de HTML5][1]. Para el uso, consulte [FileSystem artículo][2] sobre el tema HTML5 rocas. Para tener una visión general de otras opciones de almacenamiento, consulte [Guía de almacenamiento Cordova][3].

 [1]: http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
 [2]: http://www.html5rocks.com/en/tutorials/file/filesystem/
 [3]: http://cordova.apache.org/docs/en/edge/cordova_storage_storage.md.html

## Instalación

    cordova plugin add org.apache.cordova.file
    

## Plataformas soportadas

*   Amazon fuego OS
*   Android
*   BlackBerry 10
*   iOS
*   Windows Phone 7 y 8 *
*   Windows 8 *
*   Firefox OS

* *No son compatibles con estas plataformas `FileReader.readAsArrayBuffer` ni `FileWriter.write(blob)` .*

## Donde almacenar los archivos

A partir de v1.2.0, URLs a directorios de sistema de archivos importantes son proporcionadas. Cada dirección URL está en la forma *file:///path/to/spot/*y se puede convertir en un `DirectoryEntry` usando`window.resolveLocalFileSystemURL()`.

`cordova.file.applicationDirectory`-Directorio Read-only donde está instalada la aplicación. (*iOS*, *Android*)

`cordova.file.applicationStorageDirectory`-Raíz de almacenamiento escribible privado de app. (*iOS*, *Android*)

`cordova.file.dataDirectory`¿Dónde poner los archivos de datos específicos de la aplicación. (*iOS*, *Android*)

`cordova.file.cacheDirectory`-Almacena en caché los archivos que deben sobrevivir se reinicia la aplicación. Aplicaciones no deben confiar en el sistema operativo para eliminar los archivos de aquí. (*iOS*, *Android*)

`cordova.file.externalApplicationStorageDirectory`-Espacio aplicación de almacenamiento externo. (*iOS*, *Android*)

`cordova.file.externalDataDirectory`¿Dónde poner los archivos de datos específicos de la aplicación de almacenamiento externo. (*Android*)

`cordova.file.externalCacheDirectory`-Caché aplicación de almacenamiento externo. (*Android*)

`cordova.file.externalRootDirectory`-Raíz de almacenamiento externo (tarjeta SD). (*Android*)

`cordova.file.tempDirectory`-Directorio temporal que puede borrar el sistema operativo en sí. (*iOS*)

`cordova.file.syncedDataDirectory`-Contiene los archivos de la aplicación específica que deben ser sincronizados (e.g. a iCloud). (*iOS*)

`cordova.file.documentsDirectory`-Archivos privados a la aplicación, pero que son significativos para otros applciations (por ejemplo archivos de Office). (*iOS*)

## Rarezas Android

### Ubicación de almacenamiento persistente Android

Hay múltiples ubicaciones válidas para almacenar archivos persistentes en un dispositivo Android. Vea [esta página][4] para una extensa discusión de las distintas posibilidades.

 [4]: http://developer.android.com/guide/topics/data/data-storage.html

Las versiones anteriores del plugin elegiría la ubicación de los archivos temporales y persistentes en el arranque, basado en si el dispositivo afirmó que fue montado en la tarjeta SD (o partición de almacenamiento equivalente). Si fue montada en la tarjeta SD, o una partición de gran almacenamiento interno estaba disponible (como en dispositivos de Nexus,) y luego los archivos persistentes se almacenaría en la raíz de ese espacio. Esto significaba que todas las apps Cordova podían ver todos los archivos disponibles en la tarjeta.

Si la tarjeta SD no estaba disponible, entonces las versiones anteriores almacenará datos bajo /data/data /<packageid>, que aísla las apps del otro, pero todavía puede causar datos ser compartido entre los usuarios.

Ahora es posible elegir si desea almacenar archivos en la ubicación de almacenamiento del archivo interno, o usando la lógica anterior, con preferencia en el archivo config.xml de su aplicación. Para ello, añada una de estas dos líneas en config.xml:

    <preference name="AndroidPersistentFileLocation" value="Internal" />
    
    <preference name="AndroidPersistentFileLocation" value="Compatibility" />
    

Sin esta línea, el archivo plugin utilizará "Compatibilidad" como el valor por defecto. Si una etiqueta de preferencia está presente y no es uno de estos valores, no se iniciará la aplicación.

Si su solicitud se ha enviado previamente a los usuarios, mediante una mayor (1.0 pre) versión de este plugin y archivos almacenados en el sistema de ficheros persistente, entonces se debe establecer la preferencia a la "Compatibilidad". Cambiar la ubicación para "Internal" significa que los usuarios existentes que actualización su aplicación pueden ser incapaces de acceder a sus archivos previamente almacenadas, dependiendo de su dispositivo.

Si su solicitud es nueva, o nunca antes ha almacenado archivos en el sistema de ficheros persistente, el ajuste "interno" se recomienda generalmente.

## iOS rarezas

*   `FileReader.readAsText(blob, encoding)` 
    *   El `encoding` no se admite el parámetro, y codificación UTF-8 es siempre en efecto.

### iOS ubicación de almacenamiento persistente

Hay dos ubicaciones válidas para almacenar archivos persistentes en un dispositivo iOS: el directorio de documentos y el directorio de biblioteca. Las versiones anteriores del plugin sólo almacenan archivos persistentes en el directorio de documentos. Esto tenía el efecto secundario de todos los archivos de la aplicación haciendo visible en iTunes, que era a menudo involuntarios, especialmente para aplicaciones que manejan gran cantidad de archivos pequeños, en lugar de producir documentos completos para la exportación, que es la finalidad del directorio.

Ahora es posible elegir si desea almacenar archivos en los documentos o directorio de bibliotecas, con preferencia en el archivo config.xml de su aplicación. Para ello, añada una de estas dos líneas en config.xml:

    <preference name="iosPersistentFileLocation" value="Library" />
    
    <preference name="iosPersistentFileLocation" value="Compatibility" />
    

Sin esta línea, el archivo plugin utilizará "Compatibilidad" como el valor por defecto. Si una etiqueta de preferencia está presente y no es uno de estos valores, no se iniciará la aplicación.

Si su solicitud se ha enviado previamente a los usuarios, mediante una mayor (1.0 pre) versión de este plugin y archivos almacenados en el sistema de ficheros persistente, entonces se debe establecer la preferencia a la "Compatibilidad". Cambiar la ubicación a la "Biblioteca" significa que los usuarios existentes que actualización su aplicación sería incapaces de acceder a sus archivos previamente almacenadas.

Si su solicitud es nueva, o nunca antes ha almacenado archivos en el sistema de ficheros persistente, el ajuste de "Biblioteca" generalmente se recomienda.

### Firefox OS rarezas

La API de sistema de archivo de forma nativa no es compatible con Firefox OS y se implementa como una cuña en la parte superior indexedDB.

*   No falla cuando eliminar directorios no vacía
*   No admite metadatos para directorios
*   No es compatible con `requestAllFileSystems` y `resolveLocalFileSystemURI` métodos
*   Los métodos `copyTo` y `moveTo` no son compatibles con directorios

## Actualización de notas

En v1.0.0 de este plugin, la `FileEntry` y `DirectoryEntry` han cambiado las estructuras, para estar más acorde con las especificaciones publicadas.

Versiones anteriores (pre-1.0.0) del plugin almacenan el dispositivo-absoluto-archivo-ubicación en la `fullPath` propiedad de `Entry` objetos. Estos caminos típicamente parecería

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)
    

Estas rutas también fueron devueltos por el `toURL()` método de la `Entry` objetos.

Con v1.0.0, la `fullPath` es la ruta del archivo, *relativo a la raíz del sistema de archivos HTML*. Así, los caminos anteriores que ahora ambos ser representado por un `FileEntry` objeto con un `fullPath` de

    /path/to/file
    

Si su aplicación funciona con dispositivo-absoluto-caminos, y previamente obtenido esos caminos a través de la `fullPath` propiedad de `Entry` objetos, entonces debe actualizar su código para utilizar `entry.toURL()` en su lugar.

Para atrás compatibilidad, el `resolveLocalFileSystemURL()` método aceptará un dispositivo-absoluto-trayectoria y volverá un `Entry` objeto correspondiente, mientras exista ese archivo dentro de los sistemas de ficheros temporales o permanentes.

Esto ha sido particularmente un problema con el plugin de transferencia de archivos, que anteriormente utilizado dispositivo-absoluto-caminos (y todavía puede aceptarlas). Se ha actualizado para que funcione correctamente con las URLs de FileSystem, reemplazando así `entry.fullPath` con `entry.toURL()` debe resolver cualquier problema conseguir ese plugin para trabajar con archivos en el dispositivo.

En v1.1.0 el valor devuelto de `toURL()` fue cambiado (véase \[CB-6394\] (https://issues.apache.org/jira/browse/CB-6394)) para devolver una dirección URL absoluta 'file://'. siempre que sea posible. Para asegurar una ' cdvfile:'-URL puede usar `toInternalURL()` ahora. Este método devolverá ahora filesystem URLs de la forma

    cdvfile://localhost/persistent/path/to/file
    

que puede utilizarse para identificar el archivo únicamente.

## Lista de códigos de Error y significados

Cuando se produce un error, uno de los siguientes códigos se utilizará.

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

## Configurando el Plugin (opcional)

El conjunto de los sistemas de ficheros disponibles puede ser configurado por plataforma. Tanto iOS y Android reconocen un <preference> etiqueta en `config.xml` que nombra a los sistemas de archivos para ser instalado. De forma predeterminada, se activan todas las raíces del sistema de archivos.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,root" />
    

### Android

*   archivos: directorio de almacenamiento de archivo interno de la aplicación
*   archivos externos: directorio de almacenamiento de archivo externo de la aplicación
*   sdcard: el directorio de almacenamiento de archivo externo global (esta es la raíz de la tarjeta SD, si uno está instalado). Debes tener el `android.permission.WRITE_EXTERNAL_STORAGE` permiso para usar esto.
*   memoria caché: directorio de memoria caché interna de la aplicación
*   caché-externo: directorio de caché externo de la aplicación
*   raíz: el sistema de archivos de todo el dispositivo

Android también es compatible con un sistema de archivos especial llamado "documentos", que representa un subdirectorio "/ documentos /" dentro del sistema de archivos "archivos".

### iOS

*   Biblioteca: directorio de bibliotecas de la aplicación
*   documentos: directorio de documentos de la aplicación
*   memoria caché: directorio de caché de la aplicación
*   paquete: paquete de la aplicación; la ubicación de la aplicación en sí mismo en el disco (sólo lectura)
*   raíz: el sistema de archivos de todo el dispositivo

De forma predeterminada, los directorios de documentos y la biblioteca pueden ser sincronizados con iCloud. También puede solicitar dos sistemas adicionales, "biblioteca-nosync" y "documentos-nosync", que representan un directorio no-sincronizado especial dentro del sistema de ficheros de biblioteca o documentos.