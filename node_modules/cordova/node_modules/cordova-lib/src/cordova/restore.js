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
    Q                = require('q'),
    fs               = require('fs'),
    plugin           = require('./plugin'),
    events           = require('../events');

module.exports = restore;
function restore(target){
    var projectHome = cordova_util.cdProjectRoot();
    var configPath = cordova_util.projectConfig(projectHome);
    var configXml = new ConfigParser(configPath);
    return installPluginsFromConfigXML(configXml);
}


//returns a Promise
function installPluginsFromConfigXML(cfg) {
    //Install plugins that are listed on config.xml
    var pluginsFromConfig = [];
    var projectRoot = cordova_util.cdProjectRoot();
    var plugins_dir = path.join(projectRoot, 'plugins');

    var features = cfg.doc.findall('feature');
    features.forEach(function(feature){
        var params = feature.findall('param');
        var pluginId = '';
        var pluginVersion = '';
        for (var i = 0; i < params.length; i++) {
            if (params[i].attrib.name === 'id') {
                pluginId = params[i].attrib.value;
            }
            if (params[i].attrib.name === 'version') {
                pluginVersion = params[i].attrib.value;
            }
        }
        var pluginPath =  path.join(plugins_dir,pluginId);
        // contents of the plugins folder takes precedence hence
        // we ignore if the correct version is installed or not.
        if (pluginId !== '' && !fs.existsSync(pluginPath)) {
            if ( pluginVersion !== '') {
                pluginId = pluginId + '@' + pluginVersion;
            }
            events.emit('log', 'Discovered ' + pluginId + ' in config.xml. Installing to the project');
            pluginsFromConfig.push(pluginId);
        }
    });

    //Use cli instead of plugman directly ensuring all the hooks
    // to get fired.
    if (pluginsFromConfig.length >0) {
        return plugin('add', pluginsFromConfig);
    }
    return Q.all('No config.xml plugins to install');
}
