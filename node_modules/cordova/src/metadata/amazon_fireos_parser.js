/**
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
*/
var fs            = require('fs'),
    path          = require('path'),
    xml           = require('../xml-helpers'),
    util          = require('../util'),
    events        = require('../events'),
    shell         = require('shelljs'),
    project_config= require('../config'),
    Q             = require('q'),
    ConfigParser = require('../ConfigParser'),
    CordovaError = require('../CordovaError');

var awv_interface='awv_interface.jar';

var default_prefs = {
    "useBrowserHistory":"true",
    "exit-on-suspend":"false"
};

module.exports = function android_parser(project) {
    if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
        throw new CordovaError('The provided path "' + project + '" is not an Android project.');
    }
    this.path = project;
    this.strings = path.join(this.path, 'res', 'values', 'strings.xml');
    this.manifest = path.join(this.path, 'AndroidManifest.xml');
    this.android_config = path.join(this.path, 'res', 'xml', 'config.xml');
};

// Returns a promise.
// Returns a promise.
module.exports.check_requirements = function(project_root) {
    // Rely on platform's bin/create script to check requirements.
    return Q(true);
};

module.exports.prototype = {
    findOrientationPreference: function(config) {
        var ret = config.getPreference('orientation');
        if (ret && ret != 'default' && ret != 'portrait' && ret != 'landscape') {
            events.emit('warn', 'Unknown value for orientation preference: ' + ret);
            ret = null;
        }

        return ret;
    },
    
    update_from_config:function(config) {
        if (config instanceof ConfigParser) {
        } else throw new Error('update_from_config requires a ConfigParser object');

        // Update app name by editing res/values/strings.xml
        var name = config.name();
        var strings = xml.parseElementtreeSync(this.strings);
        strings.find('string[@name="app_name"]').text = name;
        fs.writeFileSync(this.strings, strings.write({indent: 4}), 'utf-8');
        events.emit('verbose', 'Wrote out Android application name to "' + name + '"');

        var manifest = xml.parseElementtreeSync(this.manifest);
        // Update the version by changing the AndroidManifest android:versionName
        var version = config.version();
        manifest.getroot().attrib["android:versionName"] = version;

        // Update package name by changing the AndroidManifest id and moving the entry class around to the proper package directory
        var pkg = config.packageName();
        pkg = pkg.replace(/-/g, '_'); // Java packages cannot support dashes
        var orig_pkg = manifest.getroot().attrib.package;
        manifest.getroot().attrib.package = pkg;

         // Set the orientation in the AndroidManifest
        var orientationPref = this.findOrientationPreference(config);
        if (orientationPref) {
            var act = manifest.getroot().find('./application/activity');
            switch (orientationPref) {
                case 'default':
                    delete act.attrib["android:screenOrientation"];
                    break;
                case 'portrait':
                    act.attrib["android:screenOrientation"] = 'userPortrait';
                    break;
                case 'landscape':
                    act.attrib["android:screenOrientation"] = 'userLandscape';
            }
        }


        // Write out AndroidManifest.xml
        fs.writeFileSync(this.manifest, manifest.write({indent: 4}), 'utf-8');

        var orig_pkgDir = path.join(this.path, 'src', path.join.apply(null, orig_pkg.split('.')));
        var java_files = fs.readdirSync(orig_pkgDir).filter(function(f) {
          return f.indexOf('.svn') == -1 && f.indexOf('.java') >= 0 && fs.readFileSync(path.join(orig_pkgDir, f), 'utf-8').match(/extends\s+CordovaActivity/);
        });
        if (java_files.length == 0) {
          throw new Error('No Java files found which extend CordovaActivity.');
        } else if(java_files.length > 1) {
          events.emit('log', 'Multiple candidate Java files (.java files which extend CordovaActivity) found. Guessing at the first one, ' + java_files[0]);
        }

        var orig_java_class = java_files[0];
        var pkgDir = path.join(this.path, 'src', path.join.apply(null, pkg.split('.')));
        shell.mkdir('-p', pkgDir);
        var orig_javs = path.join(orig_pkgDir, orig_java_class);
        var new_javs = path.join(pkgDir, orig_java_class);
        var javs_contents = fs.readFileSync(orig_javs, 'utf-8');
        javs_contents = javs_contents.replace(/package [\w\.]*;/, 'package ' + pkg + ';');
        events.emit('verbose', 'Wrote out Android package name to "' + pkg + '"');
        fs.writeFileSync(new_javs, javs_contents, 'utf-8');
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.path, 'assets', 'www');
    },

    config_xml:function(){
        return this.android_config;
    },

     // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'framework', 'assets', 'www', 'cordova.js');
        return path.resolve(jsPath);
    },

    // Replace the www dir with contents of platform_www and app www.
    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.path, 'platform_www');

        // Clear the www dir
        shell.rm('-rf', this.www_dir());
        shell.mkdir(this.www_dir());
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), this.www_dir());
        // Copy over stock platform www assets (cordova.js)
        shell.cp('-rf', path.join(platform_www, '*'), this.www_dir());
    },

    // update the overrides folder into the www folder
    update_overrides:function() {
        var projectRoot = util.isCordova(this.path);
        var merges_path = path.join(util.appDir(projectRoot), 'merges', 'amazon-fireos');
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },


    // Returns a promise.
    update_project:function(cfg) {
        var platformWww = path.join(this.path, 'assets');
        try {
            this.update_from_config(cfg);
        } catch(e) {
            return Q.reject(e);
        }
        this.update_overrides();
        // delete any .svn folders copied over
        util.deleteSvnFolders(platformWww);
        return Q();
    }
};

