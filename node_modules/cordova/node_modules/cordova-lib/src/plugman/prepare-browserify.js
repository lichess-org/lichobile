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
          unused:false, expr:true
*/

var platform_modules   = require('./platforms'),
    path               = require('path'),
    config_changes     = require('./util/config-changes'),
    xml_helpers        = require('../util/xml-helpers'),
    wp8                = require('./platforms/wp8'),
    windows8           = require('./platforms/windows8'),
    common             = require('./platforms/common'),
    fs                 = require('fs'),
    shell              = require('shelljs'),
    util               = require('util'),
    events             = require('../events'),
    plugman            = require('./plugman'),
    et                 = require('elementtree'),
    prepareNamespace   = require('./util/prepare-namespace'),
    bundle             = require('cordova-js/tasks/lib/bundle-browserify'),
    requireTr          = require('cordova-js/tasks/lib/require-tr'),
    writeLicenseHeader = require('cordova-js/tasks/lib/write-license-header');

function uninstallQueuedPlugins(platform_json, wwwDir) {
    // Check if there are any plugins queued for uninstallation, and if so, remove any of their plugin web assets loaded in
    // via <js-module> elements
    var plugins_to_uninstall = platform_json.prepare_queue.uninstalled;
    if (plugins_to_uninstall && plugins_to_uninstall.length) {
        var plugins_www = path.join(wwwDir, 'plugins');
        if (fs.existsSync(plugins_www)) {
            plugins_to_uninstall.forEach(function(plug) {
                var id = plug.id;
                var plugin_modules = path.join(plugins_www, id);
                if (fs.existsSync(plugin_modules)) {
                    events.emit('verbose', 'Removing plugins directory from www "'+plugin_modules+'"');
                    shell.rm('-rf', plugin_modules);
                }
            });
        }
    }
}

function generateFinalBundle(platform, libraryRelease, outReleaseFile) {

    var outReleaseFileStream = fs.createWriteStream(outReleaseFile);
    var commitId = 'N/A';
    var time = new Date().valueOf();

    writeLicenseHeader(outReleaseFileStream, platform, commitId);

    var releaseBundle = libraryRelease.bundle();

    releaseBundle.pipe(outReleaseFileStream);

    outReleaseFileStream.on('finish', function() {
        var newtime = new Date().valueOf() - time;
        plugman.emit('verbose', 'generated cordova.' + platform + '.js @ ' + commitId + ' in ' + newtime + 'ms');
        // TODO clean up all the *.browserify files
    });

    outReleaseFileStream.on('error', function(err) {
        var newtime = new Date().valueOf() - time;
        console.log('error while generating cordova_b.js');
        plugman.emit('verbose', 'error while generating cordova.js');
    });

}

// Called on --prepare.
// Sets up each plugin's Javascript code to be loaded properly.
// Expects a path to the project (platforms/android in CLI, . in plugman-only),
// a path to where the plugins are downloaded, the www dir, and the platform ('android', 'ios', etc.).
module.exports = function handlePrepare(project_dir, platform, plugins_dir, www_dir, is_top_level) {
    // Process:
    // - Do config munging by calling into config-changes module
    // - List all plugins in plugins_dir
    // - Load and parse their plugin.xml files.
    // - Skip those without support for this platform. (No <platform> tags means JS-only!)
    // - Build a list of all their js-modules, including platform-specific js-modules.
    // - For each js-module (general first, then platform) build up an object storing the path and any clobbers, merges and runs for it.
    events.emit('verbose', 'Preparing ' + platform + ' browserify project');
    var platform_json = config_changes.get_platform_json(plugins_dir, platform);
    var wwwDir = www_dir || platform_modules[platform].www_dir(project_dir);
    var scripts = [];

    uninstallQueuedPlugins(platform_json, www_dir);

    events.emit('verbose', 'Processing configuration changes for plugins.');
    config_changes.process(plugins_dir, project_dir, platform);

    if(!is_top_level) return;

    requireTr.platform = platform;
    var libraryRelease = bundle(platform, false, 'N/A');

    platform_json = config_changes.get_platform_json(plugins_dir, platform);
    var plugins = Object.keys(platform_json.installed_plugins).concat(Object.keys(platform_json.dependent_plugins));
    events.emit('verbose', 'Iterating over installed plugins:', plugins);

    plugins && plugins.forEach(function(plugin) {
        var pluginDir = path.join(plugins_dir, plugin),
            pluginXML = path.join(pluginDir, 'plugin.xml');
        if (!fs.existsSync(pluginXML)) {
            plugman.emit('warn', 'Missing file: ' + pluginXML);
            return;
        }
        var xml = xml_helpers.parseElementtreeSync(pluginXML);

        var plugin_id = xml.getroot().attrib.id;

        // add the plugins dir to the platform's www.
        var platformPluginsDir = path.join(wwwDir, 'plugins');
        // XXX this should not be here if there are no js-module. It leaves an empty plugins/ directory
        shell.mkdir('-p', platformPluginsDir);

        var jsModules = xml.findall('./js-module');
        var assets = xml.findall('asset');
        var platformTag = xml.find(util.format('./platform[@name="%s"]', platform));

        if (platformTag) {
            assets = assets.concat(platformTag.findall('./asset'));
            jsModules = jsModules.concat(platformTag.findall('./js-module'));
        }

        // Copy www assets described in <asset> tags.
        assets = assets || [];
        assets.forEach(function(asset) {
            common.asset.install(asset, pluginDir, wwwDir);
        });
        jsModules.forEach(function(module) {
            // Copy the plugin's files into the www directory.
            // NB: We can't always use path.* functions here, because they will use platform slashes.
            // But the path in the plugin.xml and in the cordova_plugins.js should be always forward slashes.
            var pathParts = module.attrib.src.split('/');

            var fsDirname = path.join.apply(path, pathParts.slice(0, -1));
            var fsDir = path.join(platformPluginsDir, plugin_id, fsDirname);
            shell.mkdir('-p', fsDir);

            // Read in the file, prepend the cordova.define, and write it back out.
            var moduleName = plugin_id + '.';
            if (module.attrib.name) {
                moduleName += module.attrib.name;
            } else {
                moduleName += path.basename(module.attrib.src, '.js');
            }

            var fsPath = path.join.apply(path, pathParts);
            var scriptPath = path.join(pluginDir, fsPath);

            requireTr.addModule({symbol: moduleName, path: scriptPath});

            module.getchildren().forEach(function(child) {
                if (child.tag.toLowerCase() == 'clobbers') {
                    fs.appendFileSync(scriptPath,
                      prepareNamespace(child.attrib.target, 'c'),
                      'utf-8');
                } else if (child.tag.toLowerCase() == 'merges') {
                    fs.appendFileSync(scriptPath,
                      prepareNamespace(child.attrib.target, 'm'),
                      'utf-8');
                }
            });
            scripts.push(scriptPath);
        });
    });

    libraryRelease.transform(requireTr.transform);

    scripts.forEach(function(script) {
        libraryRelease.add(script);
    });

    var outReleaseFile = path.join(wwwDir, 'cordova.js');

    generateFinalBundle(platform, libraryRelease, outReleaseFile);

};
