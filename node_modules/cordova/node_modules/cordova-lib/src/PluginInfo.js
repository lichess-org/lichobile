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

/*
A class for holidng the information currently stored in plugin.xml
It should also be able to answer questions like whether the plugin
is compatible with a given engine version.

For now it's a stub to be gradually extended.
TODO (kamrik): refactor this to use no fs sync fnctions and return promises.
*/

/* jshint node:true, laxcomma:true  */

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    xml_helpers = require('./util/xml-helpers');

// Exports
exports.PluginInfo = PluginInfo;
exports.loadPluginsDir = loadPluginsDir;


function PluginInfo(dirname) {
    var self = this;

    var filepath = path.join(dirname, 'plugin.xml');
    if (!fs.existsSync(filepath)) {
        throw new Error('Could not find plugin info in ' + dirname);
    }

    self.path = dirname;
    var et = self._et = xml_helpers.parseElementtreeSync(filepath);
    self.id = et.getroot().attrib.id;
    self.version = et.getroot().attrib.version;

    var nameTag = et.find('name');
    self.name = nameTag ? nameTag.text : null;

    self.deps = {};
    et.findall('dependency').forEach(function (d) {
        self.deps[d.attrib.id] = _.clone(d.attrib);
        // If version is not specified we want '' as default.
        // semver.satisifies(x, '') -> true.
        self.deps[d.attrib.id].version = self.deps[d.attrib.id].version || '';
    });
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