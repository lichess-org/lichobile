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
        doc.getroot().append(ret);
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
        var el = findOrCreate(this.doc, 'description');
        el.text = text;
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
     * Returns all resources for the platform specified.
     * @param  {String} platform     The platform.
     * @param {string}  resourceName Type of static resources to return.
     *                               "icon" and "splash" currently supported.
     * @return {Array}               Resources for the platform specified.
     */
    getStaticResources: function(platform, resourceName) {
        var ret = [],
            staticResources = [];
        if (platform) { // platform specific icons
            this.doc.findall('platform[@name=\'' + platform + '\']/' + resourceName).forEach(function(elt){
                elt.platform = platform; // mark as platform specific resource
                staticResources.push(elt);
            });
        }
        // root level resources
        staticResources = staticResources.concat(this.doc.findall(resourceName));
        // parse resource elements
        staticResources.forEach(function (elt) {
            var res = {};
            res.src = elt.attrib.src;
            res.density = elt.attrib['density'] || elt.attrib['cdv:density'] || elt.attrib['gap:density'];
            res.platform = elt.platform || null; // null means icon represents default icon (shared between platforms)
            res.width = elt.attrib.width;
            res.height = elt.attrib.height;

            // default icon
            if (!res.width && !res.height && !res.density) {
                ret.defaultResource = res;
            }
            ret.push(res);
        });

        /**
         * Returns resource with specified width and/or height.
         * @param  {number} width Width of resource.
         * @param  {number} height Height of resource.
         * @return {Resource} Resource object or null if not found.
         */
        ret.getBySize = function(width, height) {
            if (!width && !height){
                throw 'One of width or height must be defined';
            }
            for (var idx in this){
                var res = this[idx];
                // If only one of width or height is not specified, use another parameter for comparation
                // If both specified, compare both.
                if ((!width || (width == res.width)) &&
                    (!height || (height == res.height))){
                    return res;
                }
            }
            return null;
        };

        /**
         * Returns resource with specified density.
         * @param  {string} density Density of resource.
         * @return {Resource}       Resource object or null if not found.
         */
        ret.getByDensity = function (density) {
            for (var idx in this) {
                if (this[idx].density == density) {
                    return this[idx];
                }
            }
            return null;
        };

        /** Returns default icons */
        ret.getDefault = function() {
            return ret.defaultResource;
        };

        return ret;
    },

    /**
     * Returns all icons for specific platform.
     * @param  {string} platform Platform name
     * @return {Resource[]}      Array of icon objects.
     */
    getIcons: function(platform) {
        return this.getStaticResources(platform, 'icon');
    },

    /**
     * Returns all splash images for specific platform.
     * @param  {string} platform Platform name
     * @return {Resource[]}      Array of Splash objects.
     */
    getSplashScreens: function(platform) {
        return this.getStaticResources(platform, 'splash');
    },

    /**
     *This does not check for duplicate feature entries
     */
    addFeature: function (name, params){
        var el = new et.Element('feature');
        el.attrib.name = name;
        if (params) {
            params.forEach(function(param){
                var p = new et.Element('param');
                p.attrib.name = param.name;
                p.attrib.value = param.value;
                el.append(p);
            });
        }
        this.doc.getroot().append(el);
    },
    write:function() {
        fs.writeFileSync(this.path, this.doc.write({indent: 4}), 'utf-8');
    }
};

module.exports = ConfigParser;
