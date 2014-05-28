/*
 *
 * Copyright 2013 Anis Kadri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

// copyright (c) 2013 Andrew Lunny, Adobe Systems

var events = require('./events');
var Q = require('q');

function addProperty(o, symbol, modulePath, doWrap) {
    var val = null;

    if (doWrap) {
        o[symbol] = function() {
            val = val || require(modulePath);
            if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
                // If args exist and the last one is a function, it's the callback.
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                val.apply(o, args).done(function(result) {cb(undefined, result)}, cb);
            } else {
                val.apply(o, arguments).done(null, function(err){ throw err; });
            }
        };
    } else {
        // The top-level plugman.foo
        Object.defineProperty(o, symbol, {
            get : function() { return val = val || require(modulePath); },
            set : function(v) { val = v; }
        });
    }

    // The plugman.raw.foo
    Object.defineProperty(o.raw, symbol, {
        get : function() { return val = val || require(modulePath); },
        set : function(v) { val = v; }
    });
}

plugman = {
    on:                 events.on.bind(events),
    off:                events.removeListener.bind(events),
    removeAllListeners: events.removeAllListeners.bind(events),
    emit:               events.emit.bind(events),
    raw:                {}
};

addProperty(plugman, 'install', './install', true);
addProperty(plugman, 'uninstall', './uninstall', true);
addProperty(plugman, 'fetch', './fetch', true);
addProperty(plugman, 'prepare', './prepare');
addProperty(plugman, 'config', './config', true);
addProperty(plugman, 'owner', './owner', true);
addProperty(plugman, 'adduser', './adduser', true);
addProperty(plugman, 'publish', './publish', true);
addProperty(plugman, 'unpublish', './unpublish', true);
addProperty(plugman, 'search', './search', true);
addProperty(plugman, 'info', './info', true);
addProperty(plugman, 'create', './create', true);
addProperty(plugman, 'platform', './platform_operation', true);
addProperty(plugman, 'config_changes', './util/config-changes');

plugman.commands =  {
    'config'   : function(cli_opts) {
        plugman.config(cli_opts.argv.remain, function(err) {
            if (err) throw err;
            else console.log('done');
        });
    },
    'owner'   : function(cli_opts) {
        plugman.owner(cli_opts.argv.remain);
    },
    'install'  : function(cli_opts) {
        if(!cli_opts.platform || !cli_opts.project || !cli_opts.plugin) {
            return console.log(plugman.help());
        }
        var cli_variables = {}
        if (cli_opts.variable) {
            cli_opts.variable.forEach(function (variable) {
                    var tokens = variable.split('=');
                    var key = tokens.shift().toUpperCase();
                    if (/^[\w-_]+$/.test(key)) cli_variables[key] = tokens.join('=');
                    });
        }
        var opts = {
            subdir: '.',
            cli_variables: cli_variables,
            www_dir: cli_opts.www,
            searchpath: cli_opts.searchpath
        };

        var p = Q();
        cli_opts.plugin.forEach(function (pluginSrc) {
            p = p.then(function () {
                return plugman.raw.install(cli_opts.platform, cli_opts.project, pluginSrc, cli_opts.plugins_dir, opts);
            })
        });

        return p;
    },
    'uninstall': function(cli_opts) {
        if(!cli_opts.platform || !cli_opts.project || !cli_opts.plugin) {
            return console.log(plugman.help());
        }

        var p = Q();
        cli_opts.plugin.forEach(function (pluginSrc) {
            p = p.then(function () {
                return plugman.raw.uninstall(cli_opts.platform, cli_opts.project, pluginSrc, cli_opts.plugins_dir, { www_dir: cli_opts.www });
            });
        });

        return p;
    },
    'adduser'  : function(cli_opts) {
        plugman.adduser(function(err) {
            if (err) throw err;
            else console.log('user added');
        });
    },

    'search'   : function(cli_opts) {
        plugman.search(cli_opts.argv.remain, function(err, plugins) {
            if (err) throw err;
            else {
                for(var plugin in plugins) {
                    console.log(plugins[plugin].name, '-', plugins[plugin].description || 'no description provided');
                }
            }
        });
    },
    'info'     : function(cli_opts) {
        plugman.info(cli_opts.argv.remain, function(err, plugin_info) {
            if (err) throw err;
            else {
                console.log('name:', plugin_info.name);
                console.log('version:', plugin_info.version);
                if (plugin_info.engines) {
                    for(var i = 0, j = plugin_info.engines.length ; i < j ; i++) {
                        console.log(plugin_info.engines[i].name, 'version:', plugin_info.engines[i].version);
                    }
                }
            }
        });
    },

    'publish'  : function(cli_opts) {
        var plugin_path = cli_opts.argv.remain;
        if(!plugin_path) {
            return console.log(plugman.help());
        }
        plugman.publish(plugin_path, function(err) {
            if (err) throw err;
            else console.log('Plugin published');
        });
    },

    'unpublish': function(cli_opts) {
        var plugin = cli_opts.argv.remain;
        if(!plugin) {
            return console.log(plugman.help());
        }
        plugman.unpublish(plugin, function(err) {
            if (err) throw err;
            else console.log('Plugin unpublished');
        });
    },
    'create': function(cli_opts) {
        if( !cli_opts.name || !cli_opts.plugin_id || !cli_opts.plugin_version) {
            return console.log( plugman.help() );
        }
        var cli_variables = {};
        if (cli_opts.variable) {
            cli_opts.variable.forEach(function (variable) {
                    var tokens = variable.split('=');
                    var key = tokens.shift().toUpperCase();
                    if (/^[\w-_]+$/.test(key)) cli_variables[key] = tokens.join('=');
                    });
        }
        plugman.create( cli_opts.name, cli_opts.plugin_id, cli_opts.plugin_version, cli_opts.path || ".", cli_variables );
    },
    'platform': function(cli_opts) {
        var operation = cli_opts.argv.remain[ 0 ] || "";
        if( ( operation !== 'add' && operation !== 'remove' ) ||  !cli_opts.platform_name ) {
            return console.log( plugman.help() );
        }
        plugman.platform( { operation: operation, platform_name: cli_opts.platform_name } );
    }
};

module.exports = plugman;
