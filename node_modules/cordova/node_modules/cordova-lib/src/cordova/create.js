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

var path          = require('path'),
    fs            = require('fs'),
    shell         = require('shelljs'),
    events        = require('../events'),
    config        = require('./config'),
    lazy_load     = require('./lazy_load'),
    Q             = require('q'),
    CordovaError  = require('../CordovaError'),
    ConfigParser = require('../configparser/ConfigParser'),
    cordova_util  = require('./util');

var DEFAULT_NAME = 'HelloCordova',
    DEFAULT_ID   = 'io.cordova.hellocordova';

/**
 * Usage:
 * @dir - directory where the project will be created. Required.
 * @id - app id. Optional, default is DEFAULT_ID.
 * @name - app name. Optional, default is DEFAULT_NAME.
 * @cfg - extra config to be saved in .cordova/config.json
 **/
// Returns a promise.
module.exports = create;
function create(dir, id, name, cfg) {
    if (!dir ) {
        return Q.reject(new CordovaError(
            'At least the dir must be provided to create new project. See `'+cordova_util.binname+' help`.'
        ));
    }

    // Massage parameters
    if (typeof cfg == 'string') {
        cfg = JSON.parse(cfg);
    }
    cfg = cfg || {};
    id = id || cfg.id || DEFAULT_ID;
    name = name || cfg.name || DEFAULT_NAME;

    // Make absolute.
    dir = path.resolve(dir);

    events.emit('log', 'Creating a new cordova project with name "' + name + '" and id "' + id + '" at location "' + dir + '"');

    var www_dir = path.join(dir, 'www');

    // dir must be either empty or not exist at all.

    // dir must be either empty except for .cordova config file or not exist at all..
    var sanedircontents = function (d) {
        var contents = fs.readdirSync(d);
        if (contents.length === 0) {
            return true;
        } else if (contents.length == 1) {
            if (contents[0] == '.cordova') {
                return true;
            }
        }
        return false;
    };

    if (fs.existsSync(dir) && !sanedircontents(dir)) {
        return Q.reject(new CordovaError('Path already exists and is not empty: ' + dir));
    }

    // Read / Write .cordova/config.json file if necessary.
    config.setAutoPersist(false);
    var config_json = config(dir, cfg);

    var p;
    var symlink = false; // Whether to symlink the www dir instead of copying.
    var www_parent_dir;
    var custom_config_xml;
    var custom_merges;
    var custom_hooks;

    if (config_json.lib && config_json.lib.www) {
        events.emit('log', 'Using custom www assets from '+config_json.lib.www.uri);
        // TODO (kamrik): extend lazy_load for retrieval without caching to allow net urls for --src.
        var www_version = config_json.lib.www.version || 'not_versioned';
        var www_id = config_json.lib.www.id || 'dummy_id';
        symlink  = !!config_json.lib.www.link;

        // Make sure that the source www/ is not a direct ancestor of the target www/, or else we will recursively copy forever.
        // To do this, we make sure that the shortest relative path from source-to-target must start by going up at least one directory.
        var relative_path_from_source_to_target = path.relative(config_json.lib.www.uri, www_dir);
        var does_relative_path_go_up_at_least_one_dir = relative_path_from_source_to_target.split(path.sep)[0] == '..';
        if (!does_relative_path_go_up_at_least_one_dir) {
            throw new CordovaError(
                'Project dir "' +
                dir +
                '" must not be created at/inside the template used to create the project "' +
                config_json.lib.www.uri + '".'
            );
        }
        if(symlink) {
            p = Q(config_json.lib.www.uri);
            events.emit('verbose', 'Symlinking custom www assets into "' + www_dir + '"');
        } else {
            p = lazy_load.custom(config_json.lib.www.uri, www_id, 'www', www_version)
            .then(function(d) {
                events.emit('verbose', 'Copying custom www assets into "' + www_dir + '"');
                return d;
            });
        }
    } else {
        // No custom www - use stock cordova-hello-world-app.
        events.emit('verbose', 'Using stock cordova hello-world application.');
        p = lazy_load.cordova('www')
        .then(function(d) {
            events.emit('verbose', 'Copying stock Cordova www assets into "' + www_dir + '"');
            return d;
        });
    }

    return p.then(function(www_lib) {
        var cfg, config_json;
        if (!fs.existsSync(www_lib)) {
            throw new CordovaError('Could not find directory: '+www_lib);
        }
        // Keep going into child "www" folder if exists in stock app package.
        while (fs.existsSync(path.join(www_lib, 'www'))) {
            www_parent_dir = www_lib;
            www_lib = path.join(www_lib, 'www');
        }

        cfg = config.read(dir);
        config.setAutoPersist(true);
        config_json = config(dir, cfg);

        // Find if we also have custom merges and config.xml as siblings of custom www.
        if (www_parent_dir && config_json.lib && config_json.lib.www) {
            custom_config_xml = path.join(www_parent_dir, 'config.xml');
            if ( !fs.existsSync(custom_config_xml) ) {
                custom_config_xml = null;
            }
            custom_merges = path.join(www_parent_dir, 'merges');
            if ( !fs.existsSync(custom_merges) ) {
                custom_merges = null;
            }
            custom_hooks = path.join(www_parent_dir, 'hooks');
            if ( !fs.existsSync(custom_hooks) ) {
                custom_hooks = null;
            }
        }

        var dirAlreadyExisted = fs.existsSync(dir);
        if (!dirAlreadyExisted) {
            shell.mkdir(dir);
        }
        if (symlink) {
            try {
                fs.symlinkSync(www_lib, www_dir, 'dir');
                if (custom_merges) {
                    fs.symlinkSync(custom_merges, path.join(dir, 'merges'), 'dir');
                }
                if (custom_hooks) {
                    fs.symlinkSync(custom_hooks, path.join(dir, 'hooks'), 'dir');
                }
                if (custom_config_xml) {
                    fs.symlinkSync(custom_config_xml, path.join(dir, 'config.xml'));
                }
            } catch (e) {
                if (!dirAlreadyExisted) {
                    fs.rmdirSync(dir);
                }
                if (process.platform.slice(0, 3) == 'win' && e.code == 'EPERM')  {
                    throw new CordovaError('Symlinks on Windows require Administrator privileges');
                }
                throw e;
            }
        } else {
            shell.mkdir(www_dir);
            shell.cp('-R', path.join(www_lib, '*'), www_dir);
            if (custom_merges) {
                var merges_dir = path.join(dir, 'merges');
                shell.mkdir(merges_dir);
                shell.cp('-R', path.join(custom_merges, '*'), merges_dir);
            }
            if (custom_hooks) {
                var hooks_dir = path.join(dir, 'hooks');
                shell.mkdir(hooks_dir);
                shell.cp('-R', path.join(custom_hooks, '*'), hooks_dir);
            }
            if (custom_config_xml) {
                shell.cp(custom_config_xml, path.join(dir, 'config.xml'));
            }

        }

        // Create basic project structure.
        shell.mkdir(path.join(dir, 'platforms'));
        shell.mkdir(path.join(dir, 'plugins'));
        shell.mkdir(path.join(dir, 'hooks'));

        // Add hooks README.md
        shell.cp(path.join(__dirname, '..', '..', 'templates', 'hooks-README.md'), path.join(dir, 'hooks', 'README.md'));

        var configPath = cordova_util.projectConfig(dir);
        // Add template config.xml for apps that are missing it
        if (!fs.existsSync(configPath)) {
            var template_config_xml = path.join(__dirname, '..', '..', 'templates', 'config.xml');
            shell.cp(template_config_xml, configPath);
            // Write out id and name to config.xml
            var conf = new ConfigParser(configPath);
            conf.setPackageName(id);
            conf.setName(name);
            conf.write();
        }
    });
}
