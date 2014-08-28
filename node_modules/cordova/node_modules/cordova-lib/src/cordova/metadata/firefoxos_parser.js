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

/* jshint node:true, bitwise:true, undef:true, trailing:true, quotmark:true,
          indent:4, unused:vars, latedef:nofunc,
          sub:true
*/

var fs = require('fs'),
    path = require('path'),
    shell = require('shelljs'),
    events = require('../../events'),
    util = require('../util'),
    Q = require('q'),
    ConfigParser = require('../../configparser/ConfigParser');

module.exports = function firefoxos_parser(project) {
    this.path = project;
};

// Returns a promise.
module.exports.check_requirements = function(project_root) {
    return Q(); // Requirements always met.
};

module.exports.prototype = {
    // Returns a promise.
    update_from_config: function() {
        var config = new ConfigParser(this.config_xml());
        var manifestPath = path.join(this.www_dir(), 'manifest.webapp');
        var manifest = {};

        // Load existing manifest
        if (fs.existsSync(manifestPath)) {
            manifest = JSON.parse(fs.readFileSync(manifestPath));
        }

        // overwrite properties existing in config.xml
        var contentNode = config.doc.find('content');
        var contentSrc = contentNode.attrib['src'];
        manifest.launch_path = path.join('/', contentSrc) || '/index.html';

        manifest.installs_allowed_from = manifest.installs_allowed_from || ['*'];
        manifest.version = config.version();
        manifest.name = config.name();
        manifest.pkgName = config.packageName();
        manifest.description = config.description();
        manifest.developer = {
            name: config.author()
        };

        var authorNode = config.doc.find('author');
        var authorUrl = authorNode.attrib['href'];

        if (authorUrl) {
            manifest.developer.url = authorUrl;
        }

        var fullScreen = config.getPreference('fullscreen');

        if (fullScreen) {
            manifest.fullscreen = fullScreen;
        }

        var orientations = [];
        var preferenceNodes = config.doc.findall('preference');
        preferenceNodes.forEach(function (preference) {
            if (preference.attrib.name.toLowerCase() === 'orientation') {
                orientations.push(preference.attrib.value);
            }
        });

        if (orientations && orientations.length) {
            manifest.orientation = orientations;
        }

        var permissionNodes = config.doc.findall('permission');
        var privileged = false;

        if (permissionNodes.length) {
            manifest.permissions = {};

            permissionNodes.forEach(function(node) {
                var permissionName = node.attrib['name'];

                manifest.permissions[permissionName] = {
                    description: node.attrib['description']
                };

                if (node.attrib['access']) {
                    manifest.permissions[permissionName].access = node.attrib['access'];
                }

                if (node.attrib['privileged'] === 'true') {
                    privileged = true;
                }
            });
        }

        if (privileged) {
            manifest.type = 'privileged';
        } else {
            delete manifest.type;
        }

        var icons = config.getIcons('firefoxos');
        // if there are icon elements in config.xml
        if (icons) {
            manifest.icons = {};
            for (var i = 0; i < icons.length; i++) {
                var icon = icons[i];
                var size = icon.width;
                var sizeInt = parseInt(size);

                events.emit('verbose', 'icon[' + i + ']:' + JSON.stringify(icon));

                if (size && !isNaN(sizeInt)) {
                    if (icon.src) {
                        var destfilepath = path.join(this.www_dir(), 'icon', 'icon-' + size + '.png');

                        manifest.icons[sizeInt] = '/icon/icon-' + size + '.png';

                        if (!fs.existsSync(icon.src)) {
                            events.emit('verbose', 'ignoring icon[' + i + '] icon. File ' + icon.src + ' not found.');
                        } else {
                            events.emit('verbose', 'Copying icon from ' + icon.src + ' to ' + destfilepath);
                            shell.cp('-f', icon.src, destfilepath);
                        }
                    } else {
                        events.emit('warn', 'ignoring icon[' + i + '] no src attribute:' + JSON.stringify(icon));
                    }
                }
            }
        }

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

        return Q();
    },

    www_dir: function() {
        return path.join(this.path, 'www');
    },

    // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'cordova-lib', 'cordova.js');
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

    update_overrides: function() {
        var projectRoot = util.isCordova(this.path);
        var mergesPath = path.join(util.appDir(projectRoot), 'merges', 'firefoxos');
        if(fs.existsSync(mergesPath)) {
            var overrides = path.join(mergesPath, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },

    config_xml:function(){
        return path.join(this.path, 'config.xml');
    },

    // Returns a promise.
    update_project: function(cfg) {
        return this.update_from_config()
            .then(function(){
                this.update_overrides();
                util.deleteSvnFolders(this.www_dir());
            }.bind(this));
    }
};
