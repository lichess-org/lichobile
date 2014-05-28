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
var et = require('elementtree'),
    xml= require('../util/xml-helpers'),
    CordovaError = require('../CordovaError'),
    fs = require('fs');

/** Wraps a config.xml file */
function ConfigParser(path) {
    this.path = path;
    try {
        this.doc = xml.parseElementtreeSync(path);
    } catch (e) {
        console.error('Parsing '+path+' failed');
        throw e;
    }
    var r = this.doc.getroot();
    if (r.tag !== 'widget') {
        throw new CordovaError(path + ' has incorrect root node name (expected "widget", was "' + r.tag + '")');
    }
}

function getNodeTextSafe(el) {
    return el && el.text && el.text.trim();
}

function findOrCreate(doc, name) {
    var ret = doc.find(name);
    if (!ret) {
        ret = new et.Element(name);
        doc.getroot().append(content);
    }
    return ret;
}

ConfigParser.prototype = {
    packageName: function(id) {
        return this.doc.getroot().attrib['id'];
    },
    setPackageName: function(id) {
        this.doc.getroot().attrib['id'] = id;
    },
    name: function() {
        return getNodeTextSafe(this.doc.find('name'));
    },
    setName: function(name) {
        var el = findOrCreate(this.doc, 'name');
        el.text = name;
    },
    description: function() {
        return this.doc.find('description').text.trim();
    },
    setDescription: function(text) {
        this.doc.find('description').text = text;
        var el = findOrCreate(this.doc, 'description');
    },
    version: function() {
        return this.doc.getroot().attrib['version'];
    },
    android_versionCode: function() {
        return this.doc.getroot().attrib['android-versionCode'];
    },
    ios_CFBundleVersion: function() {
        return this.doc.getroot().attrib['ios-CFBundleVersion'];
    },
    setVersion: function(value) {
        this.doc.getroot().attrib['version'] = value;
    },
    author: function() {
        return getNodeTextSafe(this.doc.find('author'));
    },
    getPreference: function(name) {
        var preferences = this.doc.findall('preference');
        var ret = null;
        preferences.forEach(function (preference) {
            // Take the last one that matches.
            if (preference.attrib.name.toLowerCase() === name.toLowerCase()) {
                ret = preference.attrib.value;
            }
        });
        return ret;
    },
    /**
     * Returns all icons for the platform specified.
     * @param  {String} platform The platform.
     * @return {Array} Icons for the platform specified.
     */
    getIcons: function(platform) {
        var ret = [];
            iconElements = [];

        if (platform) { // platform specific icons
            this.doc.findall('platform[@name=\'' + platform + '\']/icon').forEach(function(elt){
                elt.platform = platform; // mark as platform specific icon
                iconElements.push(elt)
            });
        }
        // root level icons
        iconElements = iconElements.concat(this.doc.findall('icon'));
        // parse icon elements
        iconElements.forEach(function (elt) {
            var icon = {};
            icon.src = elt.attrib.src;
            icon.density = elt.attrib['density'] || elt.attrib['cdv:density'] || elt.attrib['gap:density'];
            icon.platform = elt.platform || null; // null means icon represents default icon (shared between platforms)
            icon.width = elt.attrib.width;
            icon.height = elt.attrib.height;
            // If one of width or Height is undefined, assume they are equal.
            icon.width = icon.width || icon.height;
            icon.height = icon.height || icon.width;

            // default icon
            if (!icon.width && !icon.height && !icon.density) {
                ret.defaultIcon = icon;
            }
            ret.push(icon);
        });

        /**
         * Returns icon with specified width and height
         * @param  {number} w  Width of icon
         * @param  {number} h  Height of icon
         * @return {Icon}      Icon object or null if not found
         */
        ret.getIconBySize = function(w, h){
            // If only one of width and height is given
            // then we assume that they are equal.
            var width = w || h, height = h || w;
            for (var idx in this) {
                var icon = this[idx];
                if (width == icon.width && height == icon.width) return icon;
            }
            return null;
        };
        /** Returns default icons */
        ret.getDefault = function() {
            return ret.defaultIcon;
        }

        return ret;
    },
    write:function() {
        fs.writeFileSync(this.path, this.doc.write({indent: 4}), 'utf-8');
    }
};

module.exports = ConfigParser;
