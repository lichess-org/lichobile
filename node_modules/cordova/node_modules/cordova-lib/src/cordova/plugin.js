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

/* jshint node: true */

var cordova_util  = require('./util'),
    path          = require('path'),
    semver        = require('semver'),
    hooker        = require('./hooker'),
    config        = require('./config'),
    Q             = require('q'),
    CordovaError  = require('../CordovaError'),
    PluginInfo    = require('../PluginInfo'),
    events        = require('./events');

// Returns a promise.
module.exports = function plugin(command, targets, opts) {
    var projectRoot = cordova_util.cdProjectRoot(),
        err;

    // Dance with all the possible call signatures we've come up over the time. They can be:
    // 1. plugin() -> list the plugins
    // 2. plugin(command, Array of targets, maybe opts object)
    // 3. plugin(command, target1, target2, target3 ... )
    // The targets are not really targets, they can be a mixture of plugins and options to be passed to plugman.

    command = command || 'ls';
    targets = targets || [];
    opts = opts || {};
    if ( opts.length ) {
        // This is the case with multiple targes as separate arguments and opts is not opts but another target.
        targets = Array.prototype.slice.call(arguments, 1);
        opts = {};
    }
    if ( !Array.isArray(targets) ) {
        // This means we had a single target given as string.
        targets = [targets];
    }
    opts.options = [];
    opts.plugins = [];

    var hooks = new hooker(projectRoot);
    var platformList = cordova_util.listPlatforms(projectRoot);

    // Massage plugin name(s) / path(s)
    var pluginPath, plugins;
    pluginPath = path.join(projectRoot, 'plugins');
    plugins = cordova_util.findPlugins(pluginPath);
    if (!targets || !targets.length) {
        if (command == 'add' || command == 'rm') {
            return Q.reject(new CordovaError('You need to qualify `add` or `remove` with one or more plugins!'));
        } else {
            targets = [];
        }
    }

    //Split targets between plugins and options
    //Assume everything after a token with a '-' is an option
    var i;
    for (i = 0; i < targets.length; i++) {
        if (targets[i].match(/^-/)) {
            opts.options = targets.slice(i);
            break;
        } else {
            opts.plugins.push(targets[i]);
        }
    }

    switch(command) {
        case 'add':
            if (!targets || !targets.length) {
                return Q.reject(new CordovaError('No plugin specified. Please specify a plugin to add. See "plugin search".'));
            }

            var config_json = config(projectRoot, {});
            var searchPath = config_json.plugin_search_path || [];
            if (typeof opts.searchpath == 'string') {
                searchPath = opts.searchpath.split(path.delimiter).concat(searchPath);
            } else if (opts.searchpath) {
                searchPath = opts.searchpath.concat(searchPath);
            }
            // Blank it out to appease unit tests.
            if (searchPath.length === 0) {
                searchPath = undefined;
            }

            return hooks.fire('before_plugin_add', opts)
            .then(function() {
                return opts.plugins.reduce(function(soFar, target) {
                    var pluginsDir = path.join(projectRoot, 'plugins');
                    return soFar.then(function() {
                        if (target[target.length - 1] == path.sep) {
                            target = target.substring(0, target.length - 1);
                        }

                        // Fetch the plugin first.
                        events.emit('verbose', 'Calling plugman.fetch on plugin "' + target + '"');
                        var plugman = require('../plugman/plugman');
                        return plugman.raw.fetch(target, pluginsDir, { searchpath: searchPath});
                    })
                    .then(function(dir) {
                        // Iterate (in serial!) over all platforms in the project and install the plugin.
                        return platformList.reduce(function(soFar, platform) {
                            return soFar.then(function() {
                                var platforms = require('./platforms');
                                var platformRoot = path.join(projectRoot, 'platforms', platform),
                                    parser = new platforms[platform].parser(platformRoot),
                                    options = {
                                        cli_variables: {},
                                        searchpath: searchPath
                                    },
                                    tokens,
                                    key,
                                    i;
                                //parse variables into cli_variables
                                for (i=0; i< opts.options.length; i++) {
                                    if (opts.options[i] === "--variable" && typeof opts.options[++i] === "string") {
                                        tokens = opts.options[i].split('=');
                                        key = tokens.shift().toUpperCase();
                                        if (/^[\w-_]+$/.test(key)) {
                                            options.cli_variables[key] = tokens.join('=');
                                        }
                                    }
                                }

                                events.emit('verbose', 'Calling plugman.install on plugin "' + dir + '" for platform "' + platform + '" with options "' + JSON.stringify(options)  + '"');
                                return plugman.raw.install(platform, platformRoot, path.basename(dir), pluginsDir, options);
                            });
                        }, Q());
                    });
                }, Q()); // end Q.all
            }).then(function() {
                return hooks.fire('after_plugin_add', opts);
            });
            break;
        case 'rm':
        case 'remove':
            if (!targets || !targets.length) {
                return Q.reject(new CordovaError('No plugin specified. Please specify a plugin to remove. See "plugin list".'));
            }
            return hooks.fire('before_plugin_rm', opts)
            .then(function() {
                return opts.plugins.reduce(function(soFar, target) {
                    // Check if we have the plugin.
                    if (plugins.indexOf(target) < 0) {
                        return Q.reject(new CordovaError('Plugin "' + target + '" is not present in the project. See "plugin list".'));
                    }

                    var targetPath = path.join(pluginPath, target);
                    // Iterate over all installed platforms and uninstall.
                    // If this is a web-only or dependency-only plugin, then
                    // there may be nothing to do here except remove the
                    // reference from the platform's plugin config JSON.
                    var plugman = require('../plugman/plugman');
                    return platformList.reduce(function(soFar, platform) {
                        return soFar.then(function() {
                            var platformRoot = path.join(projectRoot, 'platforms', platform);
                            var platforms = require('./platforms');
                            var parser = new platforms[platform].parser(platformRoot);
                            events.emit('verbose', 'Calling plugman.uninstall on plugin "' + target + '" for platform "' + platform + '"');
                            return plugman.raw.uninstall.uninstallPlatform(platform, platformRoot, target, path.join(projectRoot, 'plugins'));
                        });
                    }, Q())
                    .then(function() {
                        return plugman.raw.uninstall.uninstallPlugin(target, path.join(projectRoot, 'plugins'));
                    });
                }, Q());
            }).then(function() {
                return hooks.fire('after_plugin_rm', opts);
            });
            break;
        case 'search':
            return hooks.fire('before_plugin_search')
            .then(function() {
                var plugman = require('../plugman/plugman');
                return plugman.raw.search(opts.plugins);
            }).then(function(plugins) {
                for(var plugin in plugins) {
                    events.emit('results', plugins[plugin].name, '-', plugins[plugin].description || 'no description provided');
                }
            }).then(function() {
                return hooks.fire('after_plugin_search');
            });
        case 'ls':
        case 'list':
        default:
            return list(projectRoot, hooks);
    }
};

function list(projectRoot, hooks) {
    var pluginsList = [];
    return hooks.fire('before_plugin_ls')
    .then(function() {
        var pluginsDir = path.join(projectRoot, 'plugins');
        return PluginInfo.loadPluginsDir(pluginsDir);
    })
    .then(function(plugins) {
        if (plugins.length === 0) {
            events.emit('results', 'No plugins added. Use `cordova plugin add <plugin>`.');
            return;
        }
        var pluginsDict = {};
        var lines = [];
        var txt, p;
        for (var i=0; i<plugins.length; i++) {
            p = plugins[i];
            pluginsDict[p.id] = p;
            pluginsList.push(p.id);
            txt = p.id + ' ' + p.version + ' "' + p.name + '"';
            lines.push(txt);
        }
        // Add warnings for deps with wrong versions.
        for (var id in pluginsDict) {
            p = pluginsDict[id];
            for (var depId in p.deps) {
                var dep = pluginsDict[depId];
                //events.emit('results', p.deps[depId].version);
                //events.emit('results', dep != null);
                if (!dep) {
                    txt = 'WARNING, missing dependency: plugin ' + id +
                          ' depends on ' + depId +
                          ' but it is not installed';
                    lines.push(txt);
                } else if (!semver.satisfies(dep.version, p.deps[depId].version)) {
                    txt = 'WARNING, broken dependency: plugin ' + id +
                          ' depends on ' + depId + ' ' + p.deps[depId].version +
                          ' but installed version is ' + dep.version;
                    lines.push(txt);
                }
            }
        }
        events.emit('results', lines.join('\n'));
    })
    .then(function() {
        return hooks.fire('after_plugin_ls');
    })
    .then(function() {
        return pluginsList;
    });
}
