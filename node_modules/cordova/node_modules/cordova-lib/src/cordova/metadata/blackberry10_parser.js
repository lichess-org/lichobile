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

var fs            = require('fs'),
    path          = require('path'),
    shell         = require('shelljs'),
    util          = require('../util'),
    Q             = require('q'),
    child_process = require('child_process'),
    ConfigParser  = require('../../configparser/ConfigParser'),
    CordovaError  = require('../../CordovaError'),
    events        = require('../../events'),
    config        = require('../config');

module.exports = function blackberry_parser(project) {
    if (!fs.existsSync(path.join(project, 'www'))) {
        throw new CordovaError('The provided path "' + project + '" is not a Cordova BlackBerry10 project.');
    }
    this.path = project;
    this.config_path = path.join(this.path, 'www', 'config.xml');
    this.xml = new ConfigParser(this.config_path);
};

// Returns a promise.
module.exports.check_requirements = function(project_root) {
    var custom_path = config.has_custom_path(project_root, 'blackberry10');
    var lib_path;
    if (custom_path) {
        lib_path = path.join(custom_path, 'blackberry10');
    } else {
        lib_path = path.join(util.libDirectory, 'blackberry10', 'cordova', require('../platforms').blackberry10.version);
    }
    var d = Q.defer();
    child_process.exec('"' + path.join(lib_path, 'bin', 'check_reqs') + '"', function(err, output, stderr) {
        if (err) {
            d.reject(new CordovaError('Requirements check failed: ' + output + stderr));
        } else {
            d.resolve();
        }
    });
    return d.promise;
};

module.exports.prototype = {
    update_from_config:function(config) {
        var projectRoot = util.isCordova(this.path),
            resDir = path.join(this.path, 'platform_www', 'res'),
            icons,
            i;

        if (!config instanceof ConfigParser) {
            throw new Error('update_from_config requires a ConfigParser object');
        }

        shell.rm('-rf', resDir);
        shell.mkdir(resDir);

        icons = config.getIcons('blackberry10');
        if (icons) {
            for (i = 0; i < icons.length; i++) {
                var src = path.join(projectRoot, icons[i].src),
                    dest = path.join(this.path, 'platform_www', icons[i].src),
                    destFolder = path.join(dest, '..');

                if (!fs.existsSync(destFolder)) {
                    shell.mkdir(destFolder); // make sure target dir exists
                }
                events.emit('verbose', 'Copying icon from ' + src + ' to ' + dest);
                shell.cp('-f', src, dest);
            }
        }
    },

    // Returns a promise.
    update_project:function(cfg) {
        var self = this;

        try {
            self.update_from_config(cfg);
        } catch(e) {
            return Q.reject(e);
        }
        self.update_overrides();
        util.deleteSvnFolders(this.www_dir());
        return Q();
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.path, 'www');
    },

    config_xml:function(){
        return this.config_path;
    },

    // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'javascript', 'cordova.blackberry10.js');
        return path.resolve(jsPath);
    },

    // Replace the www dir with contents of platform_www and app www.
    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.path, 'platform_www');
        var platform_cfg_backup = new ConfigParser(this.config_path);

        // Clear the www dir
        shell.rm('-rf', this.www_dir());
        shell.mkdir(this.www_dir());
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), this.www_dir());
        // Copy over stock platform www assets (cordova.js)
        shell.cp('-rf', path.join(platform_www, '*'), this.www_dir());
        //Re-Write config.xml
        platform_cfg_backup.write();
    },

    // update the overrides folder into the www folder
    update_overrides:function() {
        var projectRoot = util.isCordova(this.path);
        var merges_path = path.join(util.appDir(projectRoot), 'merges', 'blackberry10');
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },
};
