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
# Cordova-lib Release Notes


### 0.21.4 (Jun 23, 2014)
* CB-3571, CB-2606: support for splashscreens
* Use Plugininfo module to determine plugin id and version
* Fix plugin check error, when plugin dependency with specific version is given
* CB-6709 Do not create merges/ folder when adding a platform
* CB-6140 Don't allow deletion of platform dependencies
* CB-6698: Fix 'android update lib-project' to work with paths containing spaces
* CB-6973: Run JSHint on all code in src/ via npm test
* CB-6542: Delay creating project until there's some chance that it will succeed
* folder_contents() now ignores .svn folders
* CB-6970 Share win project files manipulation code between cordova and plugman
* CB-6954: Share events.js between cordova and plugman
* CB-6698 Automatically copy sub-libraries to project's directory
* Revert "CB-6698 Resolve android <framework> relative to plugin_dir when custom=true"
* CB-6942 Describe running hooks only in verbose mode.
* CB-6512: Allow "cordova platform add /path/to/platform/files"
* Update hooks-README.md - shebang line in hooks on Windows.
* CB-6895 Add more config properties into manifest
* Allow "cordova platform add platform@version"
* Add util func for chaining promises
* removing doWrap from prepare
* adding configurable attribute
* cleaning up plugman.js for uninstall
* adding param to uninstall
* adding support for prepare flag
* adding prepare-browserify
* adding options to prepare
* adding and freezing cordova-js
* [CB-6879] config parser breakout into a cordova level module
* CB-6698 Resolve android <framework> relative to plugin_dir when custom=true
* Fix tests on node 0.11.x
* Fix android <framework> unit tests to not expect end of line.
* CB-6024: Accept cli vars as part of opts param
* Refer properties-parser package from NPM.
* CB-6859 Removed all wp7 references, tests still passing
* Extract AndroidProject class into a separate .js file
* CB-6698: Support library references for Android via the framework tag
* CB-6854 Strip BOM when adding cordova.define() to js-modules
* Add npm cache based downloading to lazy_load
* Use PluginInfo in plugman/install.js
* Extend PluginInfo to parse more of plugin.xml
* CB-6772 Provide a default for AndroidLaunchMode
* CB-6711: Use parseProjectFile when working with XCode projects.
* Start using PluginInfo object in plugman/install.js
* CB-6709 Remove merges/ folder for default apps
* support for shrinkwrap flag
* Initial implementation for restore and save plugin
* CB-6668: Use <description> for "plugin ls" when <name> is missing.
* Add --noregstry flag for disabling plugin lookup in the registry
* Remove --force from default npm settings for plugin registry
* Use "npm info" for fetching plugin metadata
* Use "npm cache add" for downloading plugins
* CB-6691: Change some instances of Error() to CordovaError()


### 0.21.1
Initial release v0.21.1 (picks up from the same version number as plugman was).