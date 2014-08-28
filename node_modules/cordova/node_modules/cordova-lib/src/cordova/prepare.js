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

var cordova_util      = require('./util'),
    ConfigParser      = require('../configparser/ConfigParser'),
    path              = require('path'),
    platforms         = require('./platforms'),
    fs                = require('fs'),
    shell             = require('shelljs'),
    et                = require('elementtree'),
    hooker            = require('./hooker'),
    lazy_load         = require('./lazy_load'),
    events            = require('../events'),
    Q                 = require('q'),
    plugman           = require('../plugman/plugman');

// Returns a promise.
exports = module.exports = function prepare(options) {
    var projectRoot = cordova_util.cdProjectRoot();

    if (!options) {
        options = {
            verbose: false,
            platforms: [],
            options: []
        };
    }

    options = cordova_util.preProcessOptions(options);

    var xml = cordova_util.projectConfig(projectRoot);
    var paths = options.platforms.map(function(p) {
        var platform_path = path.join(projectRoot, 'platforms', p);
        var parser = (new platforms[p].parser(platform_path));
        return parser.www_dir();
    });
    options.paths = paths;

    var hooks = new hooker(projectRoot);
    return hooks.fire('before_prepare', options)
    .then(function() {
        var cfg = new ConfigParser(xml);

        // Iterate over each added platform
        return Q.all(options.platforms.map(function(platform) {
            var platformPath = path.join(projectRoot, 'platforms', platform);
            return lazy_load.based_on_config(projectRoot, platform)
            .then(function(libDir) {
                var parser = new platforms[platform].parser(platformPath),
                    defaults_xml_path = path.join(platformPath, 'cordova', 'defaults.xml');
                //If defaults.xml is present, overwrite platform config.xml with it
                //Otherwise save whatever is there as defaults so it can be restored
                //or copy project config into platform if none exists
                if (fs.existsSync(defaults_xml_path)) {
                    shell.cp('-f', defaults_xml_path, parser.config_xml());
                    events.emit('verbose', 'Generating config.xml from defaults for platform "' + platform + '"');
                } else {
                    if(fs.existsSync(parser.config_xml())){
                        shell.cp('-f', parser.config_xml(), defaults_xml_path);
                    }else{
                        shell.cp('-f',xml,parser.config_xml());
                    }
                }

                var stagingPath = path.join(platformPath, '.staging');
                if (fs.existsSync(stagingPath)) {
                    events.emit('log', 'Deleting now-obsolete intermediate directory: ' + stagingPath);
                    shell.rm('-rf', stagingPath);
                }

                var platform_www = path.join(platformPath, 'platform_www');
                // Create platfom_www if project was created with older version.
                if (!fs.existsSync(platform_www)) {
                    shell.mkdir(platform_www);
                    shell.cp(parser.cordovajs_path(libDir), path.join(platform_www, 'cordova.js'));
                }

                // Replace the existing web assets with the app master versions
                parser.update_www();

                // Call plugman --prepare for this platform. sets up js-modules appropriately.
                var plugins_dir = path.join(projectRoot, 'plugins');
                events.emit('verbose', 'Calling plugman.prepare for platform "' + platform + '"');
                plugman.prepare(platformPath, platform, plugins_dir);

                // Make sure that config changes for each existing plugin is in place
                var munger = new plugman.config_changes.PlatformMunger(platform, platformPath, plugins_dir);
                munger.reapply_global_munge();
                munger.save_all();

                // Update platform config.xml based on top level config.xml
                var platform_cfg = new ConfigParser(parser.config_xml());
                exports._mergeXml(cfg.doc.getroot(), platform_cfg.doc.getroot(), platform, true);
                platform_cfg.write();

                return parser.update_project(cfg);
            });
        })).then(function() {
            return hooks.fire('after_prepare', options);
        });
    });
};

var BLACKLIST = ['platform'];
var SINGLETONS = ['content', 'author'];
function mergeXml(src, dest, platform, clobber) {
    // Do nothing for blacklisted tags.
    if (BLACKLIST.indexOf(src.tag) != -1) return;

    //Handle attributes
    Object.getOwnPropertyNames(src.attrib).forEach(function (attribute) {
        if (clobber || !dest.attrib[attribute]) {
            dest.attrib[attribute] = src.attrib[attribute];
        }
    });
    //Handle text
    if (src.text && (clobber || !dest.text)) {
        dest.text = src.text;
    }
    //Handle platform
    if (platform) {
        src.findall('platform[@name="' + platform + '"]').forEach(function (platformElement) {
            platformElement.getchildren().forEach(mergeChild);
        });
    }

    //Handle children
    src.getchildren().forEach(mergeChild);

    function mergeChild (srcChild) {
        var srcTag = srcChild.tag,
            destChild = new et.Element(srcTag),
            foundChild,
            query = srcTag + '',
            shouldMerge = true;

        if (BLACKLIST.indexOf(srcTag) === -1) {
            if (SINGLETONS.indexOf(srcTag) !== -1) {
                foundChild = dest.find(query);
                if (foundChild) {
                    destChild = foundChild;
                    dest.remove(0, destChild);
                }
            } else {
                //Check for an exact match and if you find one don't add
                Object.getOwnPropertyNames(srcChild.attrib).forEach(function (attribute) {
                    query += '[@' + attribute + '="' + srcChild.attrib[attribute] + '"]';
                });
                foundChild = dest.find(query);
                if (foundChild && textMatch(srcChild, foundChild)) {
                    destChild = foundChild;
                    dest.remove(0, destChild);
                    shouldMerge = false;
                }
            }

            mergeXml(srcChild, destChild, platform, clobber && shouldMerge);
            dest.append(destChild);
        }
    }
}

// Expose for testing.
exports._mergeXml = mergeXml;


function textMatch(elm1, elm2) {
    var text1 = elm1.text ? elm1.text.replace(/\s+/, '') : '',
        text2 = elm2.text ? elm2.text.replace(/\s+/, '') : '';
    return (text1 === '' || text1 === text2);
}
