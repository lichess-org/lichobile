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
    xml           = require('../../util/xml-helpers'),
    util          = require('../util'),
    events        = require('../../events'),
    shell         = require('shelljs'),
    Q             = require('q'),
    ConfigParser = require('../../configparser/ConfigParser'),
    CordovaError = require('../../CordovaError');


module.exports = function android_parser(project) {
    if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
        throw new CordovaError('The provided path "' + project + '" is not an Android project.');
    }
    this.path = project;
    this.strings = path.join(this.path, 'res', 'values', 'strings.xml');
    this.manifest = path.join(this.path, 'AndroidManifest.xml');
    this.android_config = path.join(this.path, 'res', 'xml', 'config.xml');
};

// Returns a promise.
module.exports.check_requirements = function(project_root) {
    // Rely on platform's bin/create script to check requirements.
    return Q(true);
};

module.exports.prototype = {
    findOrientationPreference: function(config) {
        var ret = config.getPreference('orientation');
        if (ret && ret != 'default' && ret != 'portrait' && ret != 'landscape') {
            events.emit('warn', 'Unknown value for orientation preference: ' + ret);
            ret = null;
        }

        return ret;
    },

    findAndroidLaunchModePreference: function(config) {
        var ret = config.getPreference('AndroidLaunchMode');
        var valid = ['standard', 'singleTop', 'singleTask', 'singleInstance'].indexOf(ret) !== -1;
        if (ret && !valid) {
            events.emit('warn', 'Unknown value for launchMode preference: ' + ret);
            ret = null;
        }

        return ret;
    },

    update_from_config:function(config) {
        // TODO: share code for this func with Android. Or fix it and remove
        // the below JSHint hacks line.
        // jshint unused:false, indent:false, undef:true, loopfunc:true, shadow:true
        if (config instanceof ConfigParser) {
        } else throw new Error('update_from_config requires a ConfigParser object');

        // Update app name by editing res/values/strings.xml
        var name = config.name();
        var strings = xml.parseElementtreeSync(this.strings);
        strings.find('string[@name="app_name"]').text = name;
        fs.writeFileSync(this.strings, strings.write({indent: 4}), 'utf-8');
        events.emit('verbose', 'Wrote out Android application name to "' + name + '"');

        var icons = config.getIcons('amazon-fireos');
        // if there are icon elements in config.xml
        if (icons) {
          var android_icons = {};
          var projectRoot = util.isCordova(this.path);
          var default_icon;
          var max_size;
          var max_density;
          // http://developer.android.com/design/style/iconography.html
          var densities = {
            'ldpi' : 36,
            'mdpi' : 48,
            'hdpi' : 72,
            'xhdpi' : 96
          };
          for (var i=0; i<icons.length; i++) {
            var icon = icons[i];
            var destfilepath;
            var size = icon.width;
            if (!size) {
              size = icon.height;
            }
            if (!size && !icon.density) {
              if (default_icon) {
                  events.emit('verbose', 'more than one default icon: ' + JSON.stringify(icon));
              } else {
                  default_icon = icon;
              }
            } else {
              var parseIcon = function(icon, icon_size, size, density) {
                // if density is explicitly defined, no need to calculate it from width/height
                if (icon.density) {
                    android_icons[icon.density] = icon;
                    return;
                }

                var i = parseInt(icon_size);
                if (size == parseInt(icon_size)) {
                  var previous = android_icons[density];
                  if (previous) {
                    // already have that density. platform rules
                    if (!previous.platform) {
                      android_icons[density] = icon;
                    } // else already have a platform icon of that density
                  } else {
                    android_icons[density] = icon;
                  }
                  android_icons[density] = icon;
                  if (!max_size) {
                    max_size = size;
                    max_density = density;
                  } else {
                    if (max_size < size) {
                      max_size = size;
                      max_density = density;
                    }
                  }
                }
              };
              for (var density in densities) {
                parseIcon(icon, size, densities[density], density);
              }
            }
          }

          var copyIcon = function(density) {
            var srcfilepath;
            var destfilepath = path.join(this.path, 'res', 'drawable-'+density, 'icon.png');
            if (android_icons[density]) {
              srcfilepath = path.join(projectRoot, android_icons[density].src);
            } else {
              if (default_icon) {
                srcfilepath = path.join(projectRoot, default_icon.src);
              } else {
                if (max_density) {
                  srcfilepath = path.join(projectRoot, android_icons[max_density].src);
                } else {
                  events.emit('verbose', 'no icon found matching Android typical densities');
                }
              }
            }
            if (srcfilepath) {
                events.emit('verbose', 'Copying icon from ' + srcfilepath + ' to ' + destfilepath);
                shell.cp('-f', srcfilepath, destfilepath);
            }
          }.bind(this);
          for (var density in densities) {
            copyIcon(density);
          }

        }

        var manifest = xml.parseElementtreeSync(this.manifest);
        // Update the version by changing the AndroidManifest android:versionName
        var version = config.version();
        var versionCode = config.android_versionCode() || default_versionCode(version);
        manifest.getroot().attrib['android:versionName'] = version;
        manifest.getroot().attrib['android:versionCode'] = versionCode;

        // Update package name by changing the AndroidManifest id and moving the entry class around to the proper package directory
        var pkg = config.packageName();
        pkg = pkg.replace(/-/g, '_'); // Java packages cannot support dashes
        var orig_pkg = manifest.getroot().attrib.package;
        manifest.getroot().attrib.package = pkg;

        var act = manifest.getroot().find('./application/activity');

         // Set the orientation in the AndroidManifest
        var orientationPref = this.findOrientationPreference(config);
        if (orientationPref) {
            switch (orientationPref) {
                case 'default':
                    delete act.attrib['android:screenOrientation'];
                    break;
                case 'portrait':
                    act.attrib['android:screenOrientation'] = 'portrait';
                    break;
                case 'landscape':
                    act.attrib['android:screenOrientation'] = 'landscape';
            }
        }

        // Set android:launchMode in AndroidManifest
        var androidLaunchModePref = this.findAndroidLaunchModePreference(config);
        if (androidLaunchModePref) {
            act.attrib['android:launchMode'] = androidLaunchModePref;
        } else { // User has (explicitly) set an invalid value for AndroidLaunchMode preference
            delete act.attrib['android:launchMode']; // use Android default value (standard)
        }

        // Write out AndroidManifest.xml
        fs.writeFileSync(this.manifest, manifest.write({indent: 4}), 'utf-8');

        var orig_pkgDir = path.join(this.path, 'src', path.join.apply(null, orig_pkg.split('.')));
        var java_files = fs.readdirSync(orig_pkgDir).filter(function(f) {
          return f.indexOf('.svn') == -1 && f.indexOf('.java') >= 0 && fs.readFileSync(path.join(orig_pkgDir, f), 'utf-8').match(/extends\s+CordovaActivity/);
        });
        if (java_files.length === 0) {
          throw new Error('No Java files found which extend CordovaActivity.');
        } else if(java_files.length > 1) {
          events.emit('log', 'Multiple candidate Java files (.java files which extend CordovaActivity) found. Guessing at the first one, ' + java_files[0]);
        }

        var orig_java_class = java_files[0];
        var pkgDir = path.join(this.path, 'src', path.join.apply(null, pkg.split('.')));
        shell.mkdir('-p', pkgDir);
        var orig_javs = path.join(orig_pkgDir, orig_java_class);
        var new_javs = path.join(pkgDir, orig_java_class);
        var javs_contents = fs.readFileSync(orig_javs, 'utf-8');
        javs_contents = javs_contents.replace(/package [\w\.]*;/, 'package ' + pkg + ';');
        events.emit('verbose', 'Wrote out Android package name to "' + pkg + '"');
        fs.writeFileSync(new_javs, javs_contents, 'utf-8');
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.path, 'assets', 'www');
    },

    config_xml:function(){
        return this.android_config;
    },

     // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'framework', 'assets', 'www', 'cordova.js');
        return path.resolve(jsPath);
    },

    // Replace the www dir with contents of platform_www and app www.
    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.path, 'platform_www');

        // Clear the www dir
        shell.rm('-rf', this.www_dir());
        shell.mkdir(this.www_dir());
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), this.www_dir());
        // Copy over stock platform www assets (cordova.js)
        shell.cp('-rf', path.join(platform_www, '*'), this.www_dir());
    },

    // update the overrides folder into the www folder
    update_overrides:function() {
        var projectRoot = util.isCordova(this.path);
        var merges_path = path.join(util.appDir(projectRoot), 'merges', 'amazon-fireos');
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },


    // Returns a promise.
    update_project:function(cfg) {
        var platformWww = path.join(this.path, 'assets');
        try {
            this.update_from_config(cfg);
        } catch(e) {
            return Q.reject(e);
        }
        this.update_overrides();
        // delete any .svn folders copied over
        util.deleteSvnFolders(platformWww);
        return Q();
    }
};

// Consturct the default value for versionCode as
// PATCH + MINOR * 100 + MAJOR * 10000
// see http://developer.android.com/tools/publishing/versioning.html
function default_versionCode(version) {
    var nums = version.split('-')[0].split('.').map(Number);
    var versionCode = nums[0] * 10000 + nums[1] * 100 + nums[2];
    return versionCode;
}
