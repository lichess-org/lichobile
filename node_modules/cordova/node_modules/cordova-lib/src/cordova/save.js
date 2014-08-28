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
          indent:4, unused:vars, latedef:nofunc
*/


var cordova_util    = require('./util'),
    ConfigParser     = require('../configparser/ConfigParser'),
    path             = require('path'),
    xml              = require('../util/xml-helpers'),
    Q                = require('q'),
    events           = require('../events');

module.exports = save;
function save(target, opts){
    opts = opts || {};
    var projectHome = cordova_util.cdProjectRoot();
    var configPath = cordova_util.projectConfig(projectHome);
    var configXml = new ConfigParser(configPath);
    var pluginsPath = path.join(projectHome, 'plugins');
    var plugins = cordova_util.findPlugins(pluginsPath);
    var features = configXml.doc.findall('./feature/param[@name="id"]/..');
    //clear obsolete features with id params.
    for(var i=0; i<features.length; i++){
        //somehow elementtree remove fails on me
        var childs = configXml.doc.getroot().getchildren();
        var idx = childs.indexOf(features[i]);
        if(idx > -1){
            childs.splice(idx,1);
        }
    }
    // persist the removed features here if there are no plugins
    // to be added to config.xml otherwise we can delay the
    // persist to add feature
    if((!plugins || plugins.length<1) &&
          (features && features.length)){
        configXml.write();
    }

    return Q.all(plugins.map(function(plugin){
        var currentPluginPath = path.join(pluginsPath,plugin);
        var name = readPluginName(currentPluginPath);
        var id = plugin;
        var version = readPluginVersion(currentPluginPath);
        var params = [{name:'id', value:id}];
        if(opts.shrinkwrap){
            params.push({ name: 'version', value: version });
        }
        configXml.addFeature(name,params);
        configXml.write();
        events.emit('results', 'Saved plugin info for "'+plugin+'" to config.xml');
        return Q();
    }));
}

function readPluginName(pluginPath){
    var xml_path = path.join(pluginPath, 'plugin.xml');
    var et = xml.parseElementtreeSync(xml_path);
    var el = et.getroot().find('name');
    if(el && el.text){
        return el.text.trim();
    }
    return '';
}

function readPluginVersion(pluginPath){
    var xml_path = path.join(pluginPath, 'plugin.xml');
    var et = xml.parseElementtreeSync(xml_path);
    var version = et.getroot().attrib.version;
    return version;
}
