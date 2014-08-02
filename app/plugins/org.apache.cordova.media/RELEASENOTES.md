<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# Release Notes

### 0.2.1 (Sept 5, 2013)
* CB-4432 copyright notice change

### 0.2.3 (Sept 25, 2013)
* CB-4889 bumping&resetting version
* [windows8] commandProxy was moved
* CB-4889 renaming references
* CB-4889 renaming org.apache.cordova.core.media to org.apache.cordova.media
* [CB-4847] iOS 7 microphone access requires user permission - if denied, CDVCapture, CDVSound does not handle it properly
* Rename CHANGELOG.md -> RELEASENOTES.md
* [CB-4799] Fix incorrect JS references within native code on Android & iOS
* Fix compiler/lint warnings
* Rename plugin id from AudioHandler -> media
* [CB-4763] Remove reference to cordova-android's FileHelper.
* [CB-4752] Incremented plugin version on dev branch.

### 0.2.4 (Oct 9, 2013)
* [CB-4928] plugin-media doesn't load on windows8
* [CB-4915] Incremented plugin version on dev branch.

### 0.2.5 (Oct 28, 2013)
* CB-5128: add repo + issue tag to plugin.xml for media plugin
* [CB-5010] Incremented plugin version on dev branch.

 
### 0.2.6 (Dec 4, 2013)
* [ubuntu] specify policy_group
* add ubuntu platform
* Added amazon-fireos platform. Change to use amazon-fireos as a platform if the user agent string contains 'cordova-amazon-fireos'

### 0.2.7 (Jan 02, 2014)
* CB-5658 Add doc/index.md for Media plugin
* Adding READ_PHONE_STATE to the plugin permissions

### 0.2.8 (Feb 05, 2014)
* Add preliminary support for Tizen.
* [CB-4755] Fix crash in Media.setVolume on iOS

### 0.2.9 (Feb 26, 2014)
* CB-6051 Update media plugin to work with new cdvfile:// urls
* CB-5748 Make sure that Media.onStatus is called when recording is started.

### 0.2.10 (Apr 17, 2014)
* CB-6422: [windows8] use cordova/exec/proxy
* CB-6212: [iOS] fix warnings compiled under arm64 64-bit
* CB-6225: Specify plugin dependency on File plugin 1.0.1
* CB-6460: Update license headers
* CB-6465: Add license headers to Tizen code
* Add NOTICE file

### 0.2.11 (Jun 05, 2014)
* CB-6127 Spanish and French Translations added. Github close #13
* CB-6807 Add license
* CB-6706: Relax dependency on file plugin
* CB-6478: Fix exception when try to record audio file on windows 8
* CB-6477: Add musicLibrary and microphone capabilities to windows 8 platform
* CB-6491 add CONTRIBUTING.md
