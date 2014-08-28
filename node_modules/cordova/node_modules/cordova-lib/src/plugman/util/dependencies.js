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
          expr:true
*/

var dep_graph = require('dep-graph'),
    path = require('path'),
    config_changes = require('./config-changes'),
    underscore = require('underscore'),
    xml_helpers = require('../../util/xml-helpers'),
    package;

module.exports = package = {

    resolvePath: function(plugin_id, plugins_dir)
    {
        return path.join(plugins_dir, plugin_id);
    },

    resolveConfig: function(plugin_id, plugins_dir)
    {
        return path.join(plugins_dir, plugin_id, 'plugin.xml');
    },

    generate_dependency_info:function(plugins_dir, platform) {
        var json = config_changes.get_platform_json(plugins_dir, platform);

        // TODO: store whole dependency tree in plugins/[platform].json
        // in case plugins are forcefully removed...
        var tlps = [];
        var graph = new dep_graph();
        Object.keys(json.installed_plugins).forEach(function(plugin_id) {
            tlps.push(plugin_id);

            var xml = xml_helpers.parseElementtreeSync( package.resolveConfig(plugin_id, plugins_dir) );
            var deps = xml.findall('.//dependency');

            deps && deps.forEach(function(dep) {
                graph.add(plugin_id, dep.attrib.id);
            });
        });
        Object.keys(json.dependent_plugins).forEach(function(plugin_id) {
            var xml = xml_helpers.parseElementtreeSync( package.resolveConfig(plugin_id, plugins_dir) );
            var deps = xml.findall('.//dependency');
            deps && deps.forEach(function(dep) {
                graph.add(plugin_id, dep.attrib.id);
            });
        });

        return {
            graph:graph,
            top_level_plugins:tlps
        };
    },

    // Returns a list of top-level plugins which are (transitively) dependent on the given plugin.
    dependents: function(plugin_id, plugins_dir, platform) {
        var depsInfo;
        if(typeof plugins_dir == 'object')
            depsInfo = plugins_dir;
        else
            depsInfo = package.generate_dependency_info(plugins_dir, platform);

        var graph = depsInfo.graph;
        var tlps = depsInfo.top_level_plugins;
        var dependents = tlps.filter(function(tlp) {
            return tlp != plugin_id && graph.getChain(tlp).indexOf(plugin_id) >= 0;
        });

        return dependents;
    },

    // Returns a list of plugins which the given plugin depends on, for which it is the only dependent.
    // In other words, if the given plugin were deleted, these dangling dependencies should be deleted too.
    danglers: function(plugin_id, plugins_dir, platform) {
        var depsInfo;
        if(typeof plugins_dir == 'object')
            depsInfo = plugins_dir;
        else
            depsInfo = package.generate_dependency_info(plugins_dir, platform);

        var graph = depsInfo.graph;
        var dependencies = graph.getChain(plugin_id);

        var tlps = depsInfo.top_level_plugins;
        var diff_arr = [];
        tlps.forEach(function(tlp) {
            if (tlp != plugin_id) {
                diff_arr.push(graph.getChain(tlp));
            }
        });

        // if this plugin has dependencies, do a set difference to determine which dependencies are not required by other existing plugins
        diff_arr.unshift(dependencies);
        var danglers = underscore.difference.apply(null, diff_arr);

        // Ensure no top-level plugins are tagged as danglers.
        danglers = danglers && danglers.filter(function(x) { return tlps.indexOf(x) < 0; });
        return danglers;
    }
};
