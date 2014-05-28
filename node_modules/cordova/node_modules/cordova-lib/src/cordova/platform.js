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
var config            = require('./config'),
    cordova           = require('./cordova'),
    cordova_util      = require('./util'),
    ConfigParser      = require('./ConfigParser'),
    util              = require('util'),
    fs                = require('fs'),
    os                = require('os'),
    path              = require('path'),
    hooker            = require('./hooker'),
    events            = require('./events'),
    lazy_load         = require('./lazy_load'),
    CordovaError      = require('../CordovaError'),
    Q                 = require('q'),
    platforms         = require('./platforms'),
    superspawn        = require('./superspawn'),
    semver            = require('semver'),
    shell             = require('shelljs');

function getVersionFromScript(script, defaultValue) {
    var versionPromise = Q(defaultValue);
    if (fs.existsSync(script)) {
        versionPromise = superspawn.spawn(script);
    } else {
        /* if you are here, it's probably because you're in Jasmine: fix your existsSync stub */
        versionPromise = Q(defaultValue);
    }
    return versionPromise;
}

function add(hooks, projectRoot, targets, opts) {
    var xml = cordova_util.projectConfig(projectRoot);
    var cfg = new ConfigParser(xml);
    if (!targets || !targets.length) {
        return Q.reject(new CordovaError('No platform specified. Please specify a platform to add. See "platform list".'));
    }
    var config_json = config.read(projectRoot);
    var platformsDir = path.join(projectRoot, 'platforms');

    // The "platforms" dir is safe to delete, it's almost equivalent to
    // cordova platfrom rm <list of all platforms>
    if ( !fs.existsSync(platformsDir)) {
        shell.mkdir('-p', platformsDir);
    }

    return hooks.fire('before_platform_add', opts)
    .then(function() {
        return targets.reduce(function(soFar, t) {
            return soFar.then(function() {
                return lazy_load.based_on_config(projectRoot, t)
                .then(function(libDir) {
                    var template = config_json.lib && config_json.lib[t] && config_json.lib[t].template || null;
                    var copts = null;
                    if ('spawnoutput' in opts) {
                        copts = opts.spawnoutput;
                    }
                    return call_into_create(t, projectRoot, cfg, libDir, template, copts);
                }, function(err) {
                    throw new CordovaError('Unable to fetch platform ' + t + ': ' + err);
                });
            });
        }, Q());
    })
    .then(function() {
        return hooks.fire('after_platform_add', opts);
    });
};

function remove(hooks, projectRoot, targets, opts) {
    if (!targets || !targets.length) {
        return Q.reject(new CordovaError('No platform[s] specified. Please specify platform[s] to remove. See "platform list".'));
    }
    return hooks.fire('before_platform_rm', opts)
    .then(function() {
        targets.forEach(function(target) {
            shell.rm('-rf', path.join(projectRoot, 'platforms', target));
            var plugins_json = path.join(projectRoot, 'plugins', target + '.json');
            if (fs.existsSync(plugins_json)) shell.rm(plugins_json);
        });
    }).then(function() {
        return hooks.fire('after_platform_rm', opts);
    });
}

function update(hooks, projectRoot, targets, opts) {
    // Shell out to the update script provided by the named platform.
    if (!targets || !targets.length) {
        return Q.reject(new CordovaError('No platform specified. Please specify a platform to update. See "platform list".'));
    } else if (targets.length > 1) {
        return Q.reject(new CordovaError('Platform update can only be executed on one platform at a time.'));
    } else {
        var plat = targets[0];
        var platformPath = path.join(projectRoot, 'platforms', plat);
        var installed_platforms = cordova_util.listPlatforms(projectRoot);
        if (installed_platforms.indexOf(plat) < 0) {
            return Q.reject(new CordovaError('Platform "' + plat + '" is not installed. See "platform list".'));
        }

        function copyCordovaJs() {
            var parser = new platforms[plat].parser(platformPath);
            var platform_www = path.join(platformPath, 'platform_www');
            shell.mkdir('-p', platform_www);
            shell.cp('-f', path.join(parser.www_dir(), 'cordova.js'), path.join(platform_www, 'cordova.js'));
        }

        // First, lazy_load the latest version.
        return hooks.fire('before_platform_update', opts)
        .then(function() {
            return lazy_load.based_on_config(projectRoot, plat);
        }).then(function(libDir) {
            // Call the platform's update script.
            var script = path.join(libDir, 'bin', 'update');
            return superspawn.spawn(script, [platformPath], { stdio: 'inherit' })
            .then(function() {
                // Copy the new cordova.js from www -> platform_www.
                copyCordovaJs();
                // Leave it to the update script to log out "updated to v FOO".
            });
        });
    }
}

function check(hooks, projectRoot) {
    var platformsText = [],
        platforms_on_fs = cordova_util.listPlatforms(projectRoot),
        scratch = path.join(os.tmpdir(), "cordova-platform-check-"+Date.now()),
        listeners = events._events;
        events._events = {};
    var result = Q.defer();
    cordova.raw.create(scratch)
    .then(function () {
        var h = new hooker(scratch);
        // Acquire the version number of each platform we have installed, and output that too.
        Q.all(platforms_on_fs.map(function(p) {
            var d = Q.defer();
            add(h, scratch, [p], {spawnoutput: {stdio: 'ignore'}})
            .then(function() {
                var d_avail = Q.defer(),
                    d_cur = Q.defer();
                getVersionFromScript(path.join(scratch, 'platforms', p, 'cordova', 'version'), null)
                .then(function(avail) {
                    if (!avail) {
                        /* Platform version script was silent, we can't work with this */
                        d_avail.resolve('');
                    } else {
                        d_avail.resolve(avail);
                    }
                })
                .catch(function () {
                    /* Platform version script failed, we can't work with this */
                    d_avail.resolve('');
                });
                getVersionFromScript(path.join(projectRoot, 'platforms', p, 'cordova', 'version'), null)
                .catch(function () {
                    d_cur.resolve('broken');
                }).then(function(v) {
                    d_cur.resolve(v || '');
                });
                Q.all([d_avail.promise, d_cur.promise]).spread(function (avail, v) {
                    var m;
                    if (avail && (!v || v == 'broken' || semver.gt(avail, v))) {
                        m = p + ' @ ' + (v || 'unknown') + ' could be updated to: ' + avail;
                        platformsText.push(m);
                    }
                    d.resolve(m);
                })
                .catch(function () {
                    return '?';
                })
                .done();
            })
            .catch(function () {
                /* If a platform doesn't install, then we can't realistically suggest updating */
                d.resolve();
            });
            return d.promise;
        })).then(function() {
            var results = '';
            events._events = listeners;
            shell.rm('-rf', scratch);
            if (platformsText) {
                results = platformsText.filter(function (p) {return !!p}).sort().join('\n');
            }
            if (!results) {
                results = 'All platforms are up-to-date.';
            }
            events.emit('results', results);
            result.resolve();
        })
        .done();
    }).catch(function (){
        events._events = listeners;
        shell.rm('-rf', scratch);
    })
    .done();
    return result.promise;
}

function list(hooks, projectRoot) {
    var platforms_on_fs = cordova_util.listPlatforms(projectRoot);
    return hooks.fire('before_platform_ls')
    .then(function() {
        // Acquire the version number of each platform we have installed, and output that too.
        return Q.all(platforms_on_fs.map(function(p) {
            return getVersionFromScript(path.join(projectRoot, 'platforms', p, 'cordova', 'version'), null)
            .then(function(v) {
                if (!v) return p;
                return p + ' ' + v;
            }, function(v) {
                return p + ' broken';
            });
        }));
    }).then(function(platformsText) {
        var results = 'Installed platforms: ' + platformsText.sort().join(', ') + '\n';
        var available = Object.getOwnPropertyNames(platforms).filter(function(p) {
            var platform = platforms[p] || {},
                hostos = platform.hostos || null;
            if (!hostos)
                return true;
            if (hostos.indexOf('*') >= 0)
                return true;
            if (hostos.indexOf(process.platform) >= 0)
                return true;
            return false;
        });

        available = available.filter(function(p) {
            return platforms_on_fs.indexOf(p) < 0; // Only those not already installed.
        });
        results += 'Available platforms: ' + available.sort().join(', ');

        events.emit('results', results);
    }).then(function() {
        return hooks.fire('after_platform_ls');
    });
}

// Returns a promise.
module.exports = function platform(command, targets) {
    var projectRoot = cordova_util.cdProjectRoot();

    var hooks = new hooker(projectRoot);

    if (arguments.length === 0) command = 'ls';
    if (targets) {
        if (!(targets instanceof Array)) targets = [targets];
        var err;
        targets.forEach(function(t) {
            if (!(t in platforms)) {
                err = new CordovaError('Platform "' + t + '" not recognized as a core cordova platform. See "platform list".');
            }
        });
        if (err) return Q.reject(err);
    } else {
        if (command == 'add' || command == 'rm') {
            return Q.reject(new CordovaError('You need to qualify `add` or `remove` with one or more platforms!'));
        }
    }

    var opts = {
        platforms:targets
    };
    switch(command) {
        case 'add':
            return add(hooks, projectRoot, targets, opts);
        case 'rm':
        case 'remove':
            return remove(hooks, projectRoot, targets, opts);
        case 'update':
        case 'up':
            return update(hooks, projectRoot, targets, opts);
        case 'check':
            return check(hooks, projectRoot);
        case 'ls':
        case 'list':
        default:
            return list(hooks, projectRoot);
    }
};

/**
 * Check Platform Support.
 *
 *   - {String} `name` of the platform to test.
 *   - Returns a promise, which shows any errors.
 *
 */

function supports(project_root, name) {
    // required parameters
    if (!name) return Q.reject(new CordovaError('requires a platform name parameter'));

    // check if platform exists
    var platform = platforms[name];
    if (!platform) {
        return Q.reject(new CordovaError(util.format('"%s" platform does not exist', name)));
    }

    // look up platform meta-data parser
    var platformParser = platforms[name].parser;
    if (!platformParser) {
        return Q.reject(new Error(util.format('"%s" platform parser does not exist', name)));
    }

    // check for platform support
    return platformParser.check_requirements(project_root);
};

// Expose the platform parsers on top of this command
for (var p in platforms) {
    module.exports[p] = platforms[p];
}
function createOverrides(projectRoot, target) {
    shell.mkdir('-p', path.join(cordova_util.appDir(projectRoot), 'merges', target));
};

// Returns a promise.
function call_into_create(target, projectRoot, cfg, libDir, template_dir, opts) {
    var output = path.join(projectRoot, 'platforms', target);

    // Check if output directory already exists.
    if (fs.existsSync(output)) {
        return Q.reject(new CordovaError('Platform ' + target + ' already added'));
    } else {
        // Make sure we have minimum requirements to work with specified platform
        events.emit('verbose', 'Checking if platform "' + target + '" passes minimum requirements...');
        /* XXX this is calling the public symbol so that Jasmine Spy can attack it */
        return module.exports.supports(projectRoot, target)
        .then(function() {
            events.emit('log', 'Creating ' + target + ' project...');
            var bin = path.join(libDir, 'bin', 'create');
            var args = [];
            if (target == 'android') {
                var platformVersion = fs.readFileSync(path.join(libDir, 'VERSION'), 'UTF-8').trim();
                if (semver.gt(platformVersion, '3.3.0')) {
                    args.push('--cli');
                }
            } else if (target == 'ios') {
                var platformVersion = fs.readFileSync(path.join(libDir, 'CordovaLib', 'VERSION'), 'UTF-8').trim();
                args.push('--arc');
                if (semver.gt(platformVersion, '3.3.0')) {
                    args.push('--cli');
                }
            }

            var pkg = cfg.packageName().replace(/[^\w.]/g,'_');
            var name = cfg.name();
            args.push(output, pkg, name);
            if (template_dir) {
                args.push(template_dir);
            }
            return superspawn.spawn(bin, args, opts || { stdio: 'inherit' })
            .then(function() {
                return require('./cordova').raw.prepare(target);
            })
            .then(function() {
                createOverrides(projectRoot, target);
                // Install all currently installed plugins into this new platform.
                var plugins_dir = path.join(projectRoot, 'plugins');
                var plugins = cordova_util.findPlugins(plugins_dir);
                var parser = new platforms[target].parser(output);
                if (!plugins) return Q();

                var plugman = require('../plugman/plugman');
                // Install them serially.
                return plugins.reduce(function(soFar, plugin) {
                    return soFar.then(function() {
                        events.emit('verbose', 'Installing plugin "' + plugin + '" following successful platform add of ' + target);
                        return plugman.raw.install(target, output, path.basename(plugin), plugins_dir);
                    });
                }, Q());
            });
        });
    }
}

module.exports.add = add;
module.exports.remove = remove;
module.exports.update = update;
module.exports.check = check;
module.exports.list = list;
module.exports.supports = supports;
