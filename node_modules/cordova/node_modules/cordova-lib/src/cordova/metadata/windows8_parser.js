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
          indent:4, unused:vars, latedef:nofunc, sub:true
*/

var fs            = require('fs'),
    path          = require('path'),
    util          = require('../util'),
    events        = require('../../events'),
    shell         = require('shelljs'),
    Q             = require('q'),
    child_process = require('child_process'),
    ConfigParser  = require('../../configparser/ConfigParser'),
    CordovaError  = require('../../CordovaError'),
    xml           = require('../../util/xml-helpers'),
    config        = require('../config'),
    hooker        = require('../hooker'),
    jsproj        = require('../../util/windows/jsproj');

module.exports = function windows8_parser(project) {
    try {
        // TODO : Check that it's not a windows8 project?
        var jsproj_file   = fs.readdirSync(project).filter(function(e) { return e.match(/\.jsproj$/i); })[0];
        if (!jsproj_file) throw new CordovaError('No .jsproj file in "'+project+'"');
        this.windows8_proj_dir = project;
        this.jsproj_path  = path.join(this.windows8_proj_dir, jsproj_file);
        this.sln_path     = path.join(this.windows8_proj_dir, jsproj_file.replace(/\.jsproj/, '.sln'));
    } catch(e) {
        throw new CordovaError('The provided path "' + project + '" is not a Windows 8 project. ' + e);
    }
    this.manifest_path  = path.join(this.windows8_proj_dir, 'package.appxmanifest');
};

// Returns a promise
module.exports.check_requirements = function(project_root) {
    events.emit('log', 'Checking windows8 requirements...');
    var lib_path = path.join(util.libDirectory, 'windows8', 'cordova',
                    require('../platforms').windows8.version, 'windows8');

    var custom_path = config.has_custom_path(project_root, 'windows8');
    if (custom_path) {
        lib_path = path.join(custom_path, 'windows8');
    }
    var command = '"' + path.join(lib_path, 'bin', 'check_reqs') + '"';
    events.emit('verbose', 'Running "' + command + '" (output to follow)');
    var d = Q.defer();

    child_process.exec(command, function(err, output, stderr) {
        events.emit('verbose', output);
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

        //check config parser
        if (config instanceof ConfigParser) {
        } else throw new Error('update_from_config requires a ConfigParser object');

        //Get manifest file
        var manifest = xml.parseElementtreeSync(this.manifest_path);

        var version = this.fixConfigVersion(config.version());
        var name = config.name();
        var pkgName = config.packageName();
        var author = config.author();

        var identityNode = manifest.find('.//Identity');
        if(identityNode) {
            // Update app name in identity
            var appIdName = identityNode['attrib']['Name'];
            if (appIdName != pkgName) {
                identityNode['attrib']['Name'] = pkgName;
            }

            // Update app version
            var appVersion = identityNode['attrib']['Version'];
            if(appVersion != version) {
                identityNode['attrib']['Version'] = version;
            }
        }

        // Update name (windows8 has it in the Application[@Id] and Application.VisualElements[@DisplayName])
        var app = manifest.find('.//Application');
        if(app) {

            var appId = app['attrib']['Id'];

            if (appId != pkgName) {
                app['attrib']['Id'] = pkgName;
            }

            var visualElems = manifest.find('.//VisualElements') || manifest.find('.//m2:VisualElements');

            if(visualElems) {
                var displayName = visualElems['attrib']['DisplayName'];
                if(displayName != name) {
                    visualElems['attrib']['DisplayName'] = name;
                }
            }
            else {
                throw new Error('update_from_config expected a valid package.appxmanifest' +
                                ' with a <VisualElements> node');
            }
        }
        else {
            throw new Error('update_from_config expected a valid package.appxmanifest' +
                            ' with a <Application> node');
        }

        // Update properties
        var properties = manifest.find('.//Properties');
        if (properties && properties.find) {
            var displayNameElement = properties.find('.//DisplayName');
            if (displayNameElement && displayNameElement.text != name) {
                displayNameElement.text = name;
            }

            var publisherNameElement = properties.find('.//PublisherDisplayName');
            if (publisherNameElement && publisherNameElement.text != author) {
                publisherNameElement.text = author;
            }
        }

        // sort Capability elements as per CB-5350 Windows8 build fails due to invalid 'Capabilities' definition
        // to sort elements we remove them and then add again in the appropriate order
        var capabilitiesRoot = manifest.find('.//Capabilities'),
            capabilities = capabilitiesRoot._children || [];

        capabilities.forEach(function(elem){
            capabilitiesRoot.remove(0, elem);
        });
        capabilities.sort(function(a, b) {
            return (a.tag > b.tag)? 1: -1;
        });
        capabilities.forEach(function(elem){
            capabilitiesRoot.append(elem);
        });

        //Write out manifest
        fs.writeFileSync(this.manifest_path, manifest.write({indent: 4}), 'utf-8');

        // Update icons
        var icons = config.getIcons('windows8');
        var platformRoot = this.windows8_proj_dir;
        var appRoot = util.isCordova(platformRoot);

        // Icons, that should be added to platform
        var platformIcons = [
            {dest: 'images/logo.png', width: 150, height: 150},
            {dest: 'images/smalllogo.png', width: 30, height: 30},
            {dest: 'images/storelogo.png', width: 50, height: 50},
        ];

        platformIcons.forEach(function (item) {
            var icon = icons.getBySize(item.width, item.height) || icons.getDefault();
            if (icon){
                var src = path.join(appRoot, icon.src),
                    dest = path.join(platformRoot, item.dest);
                events.emit('verbose', 'Copying icon from ' + src + ' to ' + dest);
                shell.cp('-f', src, dest);
            }
        });

        // Update splashscreen
        // Image size for Windows 8 should be 620 x 300 px
        // See http://msdn.microsoft.com/en-us/library/windows/apps/hh465338.aspx for reference
        var splash = config.getSplashScreens('windows8').getBySize(620, 300);
        if (splash){
            var src = path.join(appRoot, splash.src),
                dest = path.join(platformRoot, 'images/splashscreen.png');
            events.emit('verbose', 'Copying icon from ' + src + ' to ' + dest);
            shell.cp('-f', src, dest);
        }
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.windows8_proj_dir, 'www');
    },
    config_xml:function() {
        return path.join(this.windows8_proj_dir,'config.xml');
    },
    // copy files from merges directory to actual www dir
    copy_merges:function(merges_sub_path) {
        var merges_path = path.join(util.appDir(util.isCordova(this.windows8_proj_dir)), 'merges', merges_sub_path);
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },

    // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'template', 'www', 'cordova.js');
        return path.resolve(jsPath);
    },

    // Replace the www dir with contents of platform_www and app www and updates the csproj file.
    update_www:function() {
        var projectRoot = util.isCordova(this.windows8_proj_dir);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.windows8_proj_dir, 'platform_www');

        // Clear the www dir
        shell.rm('-rf', this.www_dir());
        shell.mkdir(this.www_dir());
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), this.www_dir());

        // Copy all files from merges directory.
        this.copy_merges('windows8');

        // Copy over stock platform www assets (cordova.js)
        shell.cp('-rf', path.join(platform_www, '*'), this.www_dir());
    },

    // updates the jsproj file to explicitly list all www content.
    update_jsproj:function() {
        var projFile = new jsproj(this.jsproj_path);

        // remove any previous references to the www files
        projFile.removeSourceFile(new RegExp('www\\\\*', 'i'));

        // now add all www references back in from the root www folder
        var www_files = this.folder_contents('www', this.www_dir());
        for(var file in www_files) {
            projFile.addSourceFile(www_files[file]);
        }
        // save file
        projFile.write();
    },
    // Returns an array of all the files in the given directory with relative paths
    // - name     : the name of the top level directory (i.e all files will start with this in their path)
    // - dir     : the directory whos contents will be listed under 'name' directory
    folder_contents:function(name, dir) {
        var results = [];
        var folder_dir = fs.readdirSync(dir);
        for(var item in folder_dir) {
            var stat = fs.statSync(path.join(dir, folder_dir[item]));
            // Add all subfolder item paths if it's not a .svn dir.
            if( stat.isDirectory() && (folder_dir[item] !== '.svn') ) {
                var sub_dir = this.folder_contents(path.join(name, folder_dir[item]), path.join(dir, folder_dir[item]));
                for(var sub_item in sub_dir) {
                    results.push(sub_dir[sub_item]);
                }
            } else if(stat.isFile()) {
                results.push(path.join(name, folder_dir[item]));
            }
            // else { it is a FIFO, or a Socket, Symbolic Link or something ... }
        }
        return results;
    },

    // calls the nessesary functions to update the windows8 project
    update_project:function(cfg) {
        //console.log("Updating windows8 project...");

        try {
            this.update_from_config(cfg);
        } catch(e) {
            return Q.reject(e);
        }

        var that = this;
        var projectRoot = util.isCordova(process.cwd());

        var hooks = new hooker(projectRoot);
        return hooks.fire('pre_package', { wwwPath:this.www_dir(), platforms: ['windows8'] })
        .then(function() {
            // overrides (merges) are handled in update_www()
            that.update_jsproj();
            that.add_bom();
            util.deleteSvnFolders(that.www_dir());
        });
    },

    // Adjust version number as per CB-5337 Windows8 build fails due to invalid app version
    fixConfigVersion: function (version) {
        if(version && version.match(/\.\d/g)) {
            var numVersionComponents = version.match(/\.\d/g).length + 1;
            while (numVersionComponents++ < 4) {
                version += '.0';
            }
        }
        return version;
    },

    // CB-5421 Add BOM to all html, js, css files to ensure app can pass Windows Store Certification
    add_bom: function () {
        var www = this.www_dir();
        var files = shell.ls('-R', www);

        files.forEach(function (file) {
            if (!file.match(/\.(js|html|css|json)/)) {
                return;
            }

            var filePath = path.join(www, file);
            var content = fs.readFileSync(filePath);

            if (content[0] !== 0xEF && content[1] !== 0xBE && content[2] !== 0xBB) {
                fs.writeFileSync(filePath, '\ufeff' + content);
            }
        });
    }
};
