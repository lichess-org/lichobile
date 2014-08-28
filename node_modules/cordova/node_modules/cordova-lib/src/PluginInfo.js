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
          sub:true, laxcomma:true, laxbreak:true
*/

/*
A class for holidng the information currently stored in plugin.xml
It should also be able to answer questions like whether the plugin
is compatible with a given engine version.

TODO (kamrik): refactor this to use no fs sync fnctions and return promises.
*/


var path = require('path')
  , fs = require('fs')
  , _ = require('underscore')
  , xml_helpers = require('./util/xml-helpers')
  , CordovaError = require('./CordovaError')
  ;

// Exports
exports.PluginInfo = PluginInfo;
exports.loadPluginsDir = loadPluginsDir;


function PluginInfo(dirname) {
    var self = this;

    // METHODS
    // Defined inside the constructor to avoid the "this" binding problems.

    // <preference> tag
    // Example: <preference name="API_KEY" />
    // Used to require a variable to be specified via --variable when installing the plugin.
    self.getPreferences = getPreferences;
    function getPreferences(platform) {
        var prefs = _getTags(self._et, 'preference', platform, _parsePreference);
        return prefs;
    }

    function _parsePreference(prefTag) {
        var pref = prefTag.attrib.name.toUpperCase();
        return pref;
    }

    // <asset>
    self.getAssets = getAssets;
    function getAssets(platform) {
        var assets = _getTags(self._et, 'asset', platform, _parseAsset);
        return assets;
    }

    function _parseAsset(tag) {
        var src = tag.attrib.src;
        var target = tag.attrib.target;

        if ( !src || !target) {
            var msg =
                'Malformed <asset> tag. Both "src" and "target" attributes'
                + 'must be specified in\n'
                + self.filepath
                ;
            throw new Error(msg);
        }

        var asset = { src: src, target: target };
        return asset;
    }


    // <dependency>
    // Example:
    // <dependency id="com.plugin.id"
    //     url="https://github.com/myuser/someplugin"
    //     commit="428931ada3891801"
    //     subdir="some/path/here" />
    self.getDependencies = getDependencies;
    function getDependencies(platform) {
        var deps = _getTags(
                self._et,
                'dependency',
                platform,
                _parseDependency
        );
        return deps;
    }

    function _parseDependency(tag) {
        var dep =
            { id : tag.attrib.id
            , url : tag.attrib.url || ''
            , subdir : tag.attrib.subdir || ''
            , commit : tag.attrib.commit
            };

        dep.git_ref = dep.commit;

        if ( !dep.id ) {
            var msg =
                '<dependency> tag is missing id attribute in '
                + self.filepath
                ;
            throw new CordovaError(msg);
        }
        return dep;
    }


    // <config-file> tag
    self.getConfigFiles = getConfigFiles;
    function getConfigFiles(platform) {
        var configFiles = _getTags(self._et, 'config-file', platform, _parseConfigFile);
        return configFiles;
    }

    function _parseConfigFile(tag) {
        var configFile =
            { target : tag.attrib['target']
            , parent : tag.attrib['parent']
            , after : tag.attrib['after']
            , xmls : tag.getchildren()
            };
        return configFile;
    }

    // <info> tags, both global and within a <platform>
    // TODO (kamrik): Do we ever use <info> under <platform>? Example wanted.
    self.getInfo = getInfo;
    function getInfo(platform) {
        var infos = _getTags(
                self._et,
                'info',
                platform,
                function(elem) { return elem.text; }
        );
        // Filter out any undefined or empty strings.
        infos = infos.filter(Boolean);
        return infos;
    }

    // <source-file>
    // Examples:
    // <source-file src="src/ios/someLib.a" framework="true" />
    // <source-file src="src/ios/someLib.a" compiler-flags="-fno-objc-arc" />
    self.getSourceFiles = getSourceFiles;
    function getSourceFiles(platform) {
        var sourceFiles = _getTagsInPlatform(self._et, 'source-file', platform, _parseSourceFile);
        return sourceFiles;
    }

    function _parseSourceFile(tag) {
        var srcFile = _.clone(tag.attrib);
        srcFile.framework = isStrTrue(srcFile.framework);
        return srcFile;
    }

    // <header-file>
    // Example:
    // <header-file src="CDVFoo.h" />
    self.getHeaderFiles = getHeaderFiles;
    function getHeaderFiles(platform) {
        var headerFiles = _getTagsInPlatform(self._et, 'header-file', platform, cloneAttribs);
        return headerFiles;
    }

    // <resource-file>
    // Example:
    // <resource-file src="FooPluginStrings.xml" target="res/values/FooPluginStrings.xml" />
    self.getResourceFiles = getResourceFiles;
    function getResourceFiles(platform) {
        var resourceFiles = _getTagsInPlatform(self._et, 'resource-file', platform, cloneAttribs);
        return resourceFiles;
    }

    // <lib-file>
    // Example:
    // <lib-file src="src/BlackBerry10/native/device/libfoo.so" arch="device" />
    self.getLibFiles = getLibFiles;
    function getLibFiles(platform) {
        var libFiles = _getTagsInPlatform(self._et, 'lib-file', platform, cloneAttribs);
        return libFiles;
    }

    // Tell whether there is a <platform> section for the given platform.
    self.hasPlatformSection = hasPlatformSection;
    function hasPlatformSection(platform) {
        var platformTag = pelem.find('./platform[@name="' + platform + '"]');
        return !!platformTag;
    }
    ///// End of PluginInfo methods /////


    ///// PluginInfo Constructor logic  /////
    self.filepath = path.join(dirname, 'plugin.xml');
    if (!fs.existsSync(self.filepath)) {
        throw new Error('Could not find plugin info in ' + dirname);
    }

    self.dir = dirname;
    var et = self._et = xml_helpers.parseElementtreeSync(self.filepath);
    var pelem = et.getroot();
    self.id = pelem.attrib.id;
    self.version = pelem.attrib.version;

    // Optional fields
    self.name = pelem.findtext('name');
    self.description = pelem.findtext('description');
    self.license = pelem.findtext('license');
    self.repo = pelem.findtext('repo');
    self.issue = pelem.findtext('issue');
    self.keywords = pelem.findtext('keywords');
    self.info = pelem.findtext('info');
    if (self.keywords) {
        self.keywords = self.keywords.split(',').map( function(s) { return s.trim(); } );
    }
}  // End of PluginInfo constructor.


// Helper function used by most of the getSomething methods of PluginInfo.
// Get all elements of a given name. Both in root and in platform sections
// for the given platform. If transform is given and is a function, it is
// applied to each element.
function _getTags(pelem, tag, platform, transform) {
    var platformTag = pelem.find('./platform[@name="' + platform + '"]');
    var tagsInRoot = pelem.findall(tag);
    tagsInRoot = tagsInRoot || [];
    var tagsInPlatform = platformTag ? platformTag.findall(tag) : [];
    var tags = tagsInRoot.concat(tagsInPlatform);
    if ( typeof transform === 'function' ) {
        tags = tags.map(transform);
    }
    return tags;
}

// Same as _getTags() but only looks inside a platfrom section.
function _getTagsInPlatform(pelem, tag, platform, transform) {
    var platformTag = pelem.find('./platform[@name="' + platform + '"]');
    var tags = platformTag ? platformTag.findall(tag) : [];
    if ( typeof transform === 'function' ) {
        tags = tags.map(transform);
    }
    return tags;
}

// Given a dir containing multiple plugins, create a PluginInfo objec for
// each of them and return as array.
// Should load them all in parallel and return a promise, but not yet.
function loadPluginsDir(dirname) {
    if ( !fs.existsSync(dirname) ){
        return [];
    }
    var subdirs = fs.readdirSync(dirname);
    var plugins = [];
    subdirs.forEach(function (subdir) {
        var d = path.join(dirname, subdir);
        if (!fs.existsSync(path.join(d, 'plugin.xml')))
            return; // continue
        var p = new PluginInfo(d);
        plugins.push(p);
    });
    return plugins;
}

// Used as the default parser for some elements in plugin.xml
function cloneAttribs(tag) {
    return _.clone(tag.attrib);
}

// Check if x is a string 'true'. Allows for variations in case and
// leading/trailing white space.
function isStrTrue(x) {
    return (typeof x === 'string') && (x.trim().toLowerCase() == 'true');
}
