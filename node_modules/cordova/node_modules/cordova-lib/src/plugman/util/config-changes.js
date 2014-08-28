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

/*
 * This module deals with shared configuration / dependency "stuff". That is:
 * - XML configuration files such as config.xml, AndroidManifest.xml or WMAppManifest.xml.
 * - plist files in iOS
 * - pbxproj files in iOS
 * Essentially, any type of shared resources that we need to handle with awareness
 * of how potentially multiple plugins depend on a single shared resource, should be
 * handled in this module.
 *
 * The implementation uses an object as a hash table, with "leaves" of the table tracking
 * reference counts.
 */

/* jshint node:true, bitwise:true, undef:true, trailing:true, quotmark:true,
          indent:4, unused:vars, latedef:nofunc,
          sub:true
*/

var fs   = require('fs'),
    path = require('path'),
    glob = require('glob'),
    plist = require('plist-with-patches'),
    bplist = require('bplist-parser'),
    et   = require('elementtree'),
    _ = require('underscore'),
    xml_helpers = require('../../util/xml-helpers'),
    platforms = require('./../platforms'),
    events = require('../../events'),
    plist_helpers = require('./../util/plist-helpers');


// These frameworks are required by cordova-ios by default. We should never add/remove them.
var keep_these_frameworks = [
    'MobileCoreServices.framework',
    'CoreGraphics.framework',
    'CoreLocation.framework',
    'AssetsLibrary.framework'
];


exports.PlatformMunger = PlatformMunger;

/******************************************************************************
Adapters to keep the current refactoring effort to within this file
******************************************************************************/
exports.add_plugin_changes = function(platform, project_dir, plugins_dir, plugin_id, plugin_vars, is_top_level, should_increment, cache) {
    var munger = new PlatformMunger(platform, project_dir, plugins_dir);
    munger.add_plugin_changes(plugin_id, plugin_vars, is_top_level, should_increment, cache);
    munger.save_all();
};

exports.remove_plugin_changes = function(platform, project_dir, plugins_dir, plugin_name, plugin_id, is_top_level, should_decrement) {
    // TODO: should_decrement parameter is never used, remove it here and wherever called
    var munger = new PlatformMunger(platform, project_dir, plugins_dir);
    munger.remove_plugin_changes(plugin_name, plugin_id, is_top_level);
    munger.save_all();
};

exports.process = function(plugins_dir, project_dir, platform) {
    var munger = new PlatformMunger(platform, project_dir, plugins_dir);
    munger.process();
    munger.save_all();
};

exports.get_munge_change = function(munge, keys) {
    return deep_find.apply(null, arguments);
};

/******************************************************************************/


exports.add_installed_plugin_to_prepare_queue = add_installed_plugin_to_prepare_queue;
function add_installed_plugin_to_prepare_queue(plugins_dir, plugin, platform, vars, is_top_level) {
    checkPlatform(platform);
    var config = exports.get_platform_json(plugins_dir, platform);
    config.prepare_queue.installed.push({'plugin':plugin, 'vars':vars, 'topLevel':is_top_level});
    exports.save_platform_json(config, plugins_dir, platform);
}

exports.add_uninstalled_plugin_to_prepare_queue = add_uninstalled_plugin_to_prepare_queue;
function add_uninstalled_plugin_to_prepare_queue(plugins_dir, plugin, platform, is_top_level) {
    checkPlatform(platform);

    var plugin_xml = xml_helpers.parseElementtreeSync(path.join(plugins_dir, plugin, 'plugin.xml'));
    var config = exports.get_platform_json(plugins_dir, platform);
    config.prepare_queue.uninstalled.push({'plugin':plugin, 'id':plugin_xml.getroot().attrib['id'], 'topLevel':is_top_level});
    exports.save_platform_json(config, plugins_dir, platform);
}


/******************************************************************************
* PlatformMunger class
*
* Can deal with config file of a single project.
* Parsed config files are cached in a ConfigKeeper object.
******************************************************************************/
function PlatformMunger(platform, project_dir, plugins_dir) {
    checkPlatform(platform);
    this.platform = platform;
    this.project_dir = project_dir;
    this.plugins_dir = plugins_dir;
    this.platform_handler = platforms[platform];
    this.config_keeper = new ConfigKeeper();
}

// Write out all unsaved files.
PlatformMunger.prototype.save_all = PlatformMunger_save_all;
function PlatformMunger_save_all() {
    this.config_keeper.save_all();
}

// Apply a munge object to a single config file.
// The remove parameter tells whether to add the change or remove it.
PlatformMunger.prototype.apply_file_munge = PlatformMunger_apply_file_munge;
function PlatformMunger_apply_file_munge(file, munge, remove) {
    var self = this;
    var xml_child;

    if ( file === 'framework' && self.platform === 'ios' ) {
        // ios pbxproj file
        var pbxproj = self.config_keeper.get(self.project_dir, self.platform, 'framework');
        for (var src in munge.parents) {
            for (xml_child in munge.parents[src]) {
                var xml = munge.parents[src][xml_child].xml;
                // Only add the framework if it's not a cordova-ios core framework
                if (keep_these_frameworks.indexOf(src) == -1) {
                    // xml_child in this case is whether the framework should use weak or not
                    if (remove) {
                        pbxproj.data.removeFramework(src);
                    } else {
                        pbxproj.data.addFramework(src, {weak: (xml === 'true')});
                    }
                    pbxproj.is_changed = true;
                }
            }
        }
    } else {
        // all other types of files
        for (var selector in munge.parents) {
            for (xml_child in munge.parents[selector]) {
                // this xml child is new, graft it (only if config file exists)
                var config_file = self.config_keeper.get(self.project_dir, self.platform, file);
                if (config_file.exists) {
                    if (remove) config_file.prune_child(selector, munge.parents[selector][xml_child]);
                    else config_file.graft_child(selector, munge.parents[selector][xml_child]);
                }
            }
        }
    }
}


PlatformMunger.prototype.remove_plugin_changes = remove_plugin_changes;
function remove_plugin_changes(plugin_name, plugin_id, is_top_level) {
    var self = this;
    var platform_config = exports.get_platform_json(self.plugins_dir, self.platform);
    var plugin_dir = path.join(self.plugins_dir, plugin_name);
    var plugin_vars = (is_top_level ? platform_config.installed_plugins[plugin_id] : platform_config.dependent_plugins[plugin_id]);

    // get config munge, aka how did this plugin change various config files
    var config_munge = self.generate_plugin_config_munge(plugin_dir, plugin_vars);
    // global munge looks at all plugins' changes to config files
    var global_munge = platform_config.config_munge;
    var munge = decrement_munge(global_munge, config_munge);

    for (var file in munge.files) {
        if (file == 'plugins-plist' && self.platform == 'ios') {
            // TODO: remove this check and <plugins-plist> sections in spec/plugins/../plugin.xml files.
            events.emit(
                'warn',
                'WARNING: Plugin "' + plugin_id + '" uses <plugins-plist> element(s), ' +
                'which are no longer supported. Support has been removed as of Cordova 3.4.'
            );
            continue;
        }
        self.apply_file_munge(file, munge.files[file], /* remove = */ true);
    }

    // Remove from installed_plugins
    if (is_top_level) {
        delete platform_config.installed_plugins[plugin_id];
    } else {
        delete platform_config.dependent_plugins[plugin_id];
    }

    // save
    exports.save_platform_json(platform_config, self.plugins_dir, self.platform);
}


PlatformMunger.prototype.add_plugin_changes = add_plugin_changes;
function add_plugin_changes(plugin_id, plugin_vars, is_top_level, should_increment) {
    var self = this;
    var platform_config = exports.get_platform_json(self.plugins_dir, self.platform);
    var plugin_dir = path.join(self.plugins_dir, plugin_id);

    var plugin_config = self.config_keeper.get(plugin_dir, '', 'plugin.xml');
    plugin_id = plugin_config.data.getroot().attrib.id;

    // get config munge, aka how should this plugin change various config files
    var config_munge = self.generate_plugin_config_munge(plugin_dir, plugin_vars);
    // global munge looks at all plugins' changes to config files

    // TODO: The should_increment param is only used by cordova-cli and is going away soon.
    // If should_increment is set to false, avoid modifying the global_munge (use clone)
    // and apply the entire config_munge because it's already a proper subset of the global_munge.
    var munge, global_munge;
    if (should_increment) {
        global_munge = platform_config.config_munge;
        munge = increment_munge(global_munge, config_munge);
    } else {
        global_munge = clone_munge(platform_config.config_munge);
        munge = config_munge;
    }

    for (var file in munge.files) {
        // TODO: remove this warning some time after 3.4 is out.
        if (file == 'plugins-plist' && self.platform == 'ios') {
            events.emit(
                'warn',
                'WARNING: Plugin "' + plugin_id + '" uses <plugins-plist> element(s), ' +
                'which are no longer supported. Support has been removed as of Cordova 3.4.'
            );
            continue;
        }
        self.apply_file_munge(file, munge.files[file]);
    }

    // Move to installed_plugins if it is a top-level plugin
    if (is_top_level) {
        platform_config.installed_plugins[plugin_id] = plugin_vars || {};
    } else {
        platform_config.dependent_plugins[plugin_id] = plugin_vars || {};
    }

    // save
    exports.save_platform_json(platform_config, self.plugins_dir, self.platform);
}


// Load the global munge from platform json and apply all of it.
// Used by cordova prepare to re-generate some config file from platform
// defaults and the global munge.
PlatformMunger.prototype.reapply_global_munge = reapply_global_munge ;
function reapply_global_munge () {
    var self = this;

    var platform_config = exports.get_platform_json(self.plugins_dir, self.platform);
    var global_munge = platform_config.config_munge;
    for (var file in global_munge.files) {
        // TODO: remove this warning some time after 3.4 is out.
        if (file == 'plugins-plist' && self.platform == 'ios') {
            events.emit(
                'warn',
                'WARNING: One of your plugins uses <plugins-plist> element(s), ' +
                'which are no longer supported. Support has been removed as of Cordova 3.4.'
            );
            continue;
        }

        self.apply_file_munge(file, global_munge.files[file]);
    }
}


// generate_plugin_config_munge
// Generate the munge object from plugin.xml + vars
PlatformMunger.prototype.generate_plugin_config_munge = generate_plugin_config_munge;
function generate_plugin_config_munge(plugin_dir, vars) {
    var self = this;

    vars = vars || {};
    // Add PACKAGE_NAME variable into vars
    if (!vars['PACKAGE_NAME']) {
        vars['PACKAGE_NAME'] = self.platform_handler.package_name(self.project_dir);
    }

    var munge = { files: {} };
    var plugin_config = self.config_keeper.get(plugin_dir, '', 'plugin.xml');
    var plugin_xml = plugin_config.data;

    var platformTag = plugin_xml.find('platform[@name="' + self.platform + '"]');
    var changes = [];
    // add platform-agnostic config changes
    changes = changes.concat(plugin_xml.findall('config-file'));
    if (platformTag) {
        // add platform-specific config changes if they exist
        changes = changes.concat(platformTag.findall('config-file'));

        // note down pbxproj framework munges in special section of munge obj
        // CB-5238 this is only for systems frameworks
        if (self.platform === 'ios') {
            var frameworks = platformTag.findall('framework');
            frameworks.forEach(function (f) {
                var custom = f.attrib['custom'];
                if (!custom) {
                    var file = f.attrib['src'];
                    var weak = ('true' == f.attrib['weak']).toString();

                    deep_add(munge, 'framework', file, { xml: weak, count: 1 });
                }
            });
        }
    }

    changes.forEach(function(change) {
        var target = change.attrib['target'];
        var parent = change.attrib['parent'];
        var after = change.attrib['after'];
        var xmls = change.getchildren();
		xmls.forEach(function(xml) {
            // 1. stringify each xml
            var stringified = (new et.ElementTree(xml)).write({xml_declaration:false});
            // interp vars
            if (vars) {
                Object.keys(vars).forEach(function(key) {
                    var regExp = new RegExp('\\$' + key, 'g');
                    stringified = stringified.replace(regExp, vars[key]);
                });
            }
            // 2. add into munge
            deep_add(munge, target, parent, { xml: stringified, count: 1, after: after });
        });
    });
    return munge;
}

// Go over the prepare queue an apply the config munges for each plugin
// that has been (un)installed.
PlatformMunger.prototype.process = PlatformMunger_process;
function PlatformMunger_process() {
    var self = this;

    var platform_config = exports.get_platform_json(self.plugins_dir, self.platform);

    // Uninstallation first
    platform_config.prepare_queue.uninstalled.forEach(function(u) {
        self.remove_plugin_changes(u.plugin, u.id, u.topLevel);
    });

    // Now handle installation
    platform_config.prepare_queue.installed.forEach(function(u) {
        self.add_plugin_changes(u.plugin, u.vars, u.topLevel, true);
    });

    platform_config = exports.get_platform_json(self.plugins_dir, self.platform);

    // Empty out installed/ uninstalled queues.
    platform_config.prepare_queue.uninstalled = [];
    platform_config.prepare_queue.installed = [];
    // save platform json
    exports.save_platform_json(platform_config, self.plugins_dir, self.platform);
}
/**** END of PlatformMunger ****/


/******************************************************************************
* ConfigKeeper class
*
* Used to load and store config files to avoid re-parsing and writing them out
* multiple times.
*
* The config files are referred to by a fake path constructed as
* project_dir/platform/file
* where file is the name used for the file in config munges.
******************************************************************************/
function ConfigKeeper() {
    this._cached = {};
}

ConfigKeeper.prototype.get = ConfigKeeper_get;
function ConfigKeeper_get(project_dir, platform, file) {
    var self = this;

    //This fixes a bug with older plugins - when specifying config xml instead of res/xml/config.xml
    //https://issues.apache.org/jira/browse/CB-6414
    if(file == 'config.xml' && platform == 'android'){
        file = 'res/xml/config.xml';
    }
    var fake_path = path.join(project_dir, platform, file);

    if (self._cached[fake_path]) {
        return self._cached[fake_path];
    }
    // File was not cached, need to load.
    var config_file = new ConfigFile(project_dir, platform, file);
    self._cached[fake_path] = config_file;
    return config_file;
}


ConfigKeeper.prototype.save_all = ConfigKeeper_save_all;
function ConfigKeeper_save_all() {
    var self = this;
    Object.keys(self._cached).forEach(function (fake_path) {
        var config_file = self._cached[fake_path];
        if (config_file.is_changed) config_file.save();
    });
}
/**** END of ConfigKeeper ****/

// TODO: move save/get_platform_json to be part of ConfigKeeper or ConfigFile
// For now they are used in many places in plugman and cordova-cli and can
// save the file bypassing the ConfigKeeper's cache.
exports.get_platform_json = get_platform_json;
function get_platform_json(plugins_dir, platform) {
    checkPlatform(platform);

    var filepath = path.join(plugins_dir, platform + '.json');
    if (fs.existsSync(filepath)) {
        return fix_munge(JSON.parse(fs.readFileSync(filepath, 'utf-8')));
    } else {
        var config = {
            prepare_queue:{installed:[], uninstalled:[]},
            config_munge:{},
            installed_plugins:{},
            dependent_plugins:{}
        };
        return config;
    }
}

exports.save_platform_json = save_platform_json;
function save_platform_json(config, plugins_dir, platform) {
    checkPlatform(platform);
    var filepath = path.join(plugins_dir, platform + '.json');
    fs.writeFileSync(filepath, JSON.stringify(config, null, 4), 'utf-8');
}


// convert a munge from the old format ([file][parent][xml] = count) to the current one
function fix_munge(platform_config) {
    var munge = platform_config.config_munge;
    if (!munge.files) {
        var new_munge = { files: {} };
        for (var file in munge) {
            for (var selector in munge[file]) {
                for (var xml_child in munge[file][selector]) {
                    var val = parseInt(munge[file][selector][xml_child]);
                    for (var i = 0; i < val; i++) {
                        deep_add(new_munge, [file, selector, { xml: xml_child, count: val }]);
                    }
                }
            }
        }
        platform_config.config_munge = new_munge;
    }

    return platform_config;
}

/**** END of ConfigKeeper ****/


/******************************************************************************
* ConfigFile class
*
* Can load and keep various types of config files. Provides some functionality
* specific to some file types such as grafting XML children. In most cases it
* should be instantiated by ConfigKeeper.
*
* For plugin.xml files use as:
* plugin_config = self.config_keeper.get(plugin_dir, '', 'plugin.xml');
*
* TODO: Consider moving it out to a separate file and maybe partially with
* overrides in platform handlers.
******************************************************************************/
function ConfigFile(project_dir, platform, file_tag) {
    this.project_dir = project_dir;
    this.platform = platform;
    this.file_tag = file_tag;
    this.is_changed = false;

    this.load();
}

// ConfigFile.load()
ConfigFile.prototype.load = ConfigFile_load;
function ConfigFile_load() {
    var self = this;

    // config file may be in a place not exactly specified in the target
    var filepath = self.filepath = resolveConfigFilePath(self.project_dir, self.platform, self.file_tag);

    if ( !filepath || !fs.existsSync(filepath) ) {
        self.exists = false;
        return;
    }
    self.exists = true;
    var ext = path.extname(filepath);
    // Windows8 uses an appxmanifest, and wp8 will likely use
    // the same in a future release
    if (ext == '.xml' || ext == '.appxmanifest') {
        self.type = 'xml';
        self.data = xml_helpers.parseElementtreeSync(filepath);
    } else if (ext == '.pbxproj') {
        self.type = 'pbxproj';
        self.data = platforms.ios.parseProjectFile(self.project_dir).xcode;
    } else {
        // plist file
        self.type = 'plist';
        // TODO: isBinaryPlist() reads the file and then parse re-reads it again.
        //       We always write out text plist, not binary.
        //       Do we still need to support binary plist?
        //       If yes, use plist.parseStringSync() and read the file once.
        self.plist_module = (isBinaryPlist(filepath) ? bplist : plist);
        self.data = self.plist_module.parseFileSync(filepath);
    }
}

// ConfigFile.save()
ConfigFile.prototype.save = ConfigFile_save;
function ConfigFile_save() {
    var self = this;
    if (self.type === 'xml') {
        fs.writeFileSync(self.filepath, self.data.write({indent: 4}), 'utf-8');
    } else if (self.type === 'pbxproj') {
        fs.writeFileSync(self.filepath, self.data.writeSync());
    } else {
        // plist
        var regExp = new RegExp('<string>[ \t\r\n]+?</string>', 'g');
        fs.writeFileSync(self.filepath, plist.build(self.data).replace(regExp, '<string></string>'));
    }
    self.is_changed = false;
}

// ConfigFile.graft_child()
ConfigFile.prototype.graft_child = ConfigFile_graft_child;
function ConfigFile_graft_child(selector, xml_child) {
    var self = this;
    var filepath = self.filepath;
    var result;
    if (self.type === 'xml') {
        var xml_to_graft = [et.XML(xml_child.xml)];
        result = xml_helpers.graftXML(self.data, xml_to_graft, selector, xml_child.after);
        if ( !result) {
            throw new Error('grafting xml at selector "' + selector + '" from "' + filepath + '" during config install went bad :(');
        }
    } else {
        // plist file
        result = plist_helpers.graftPLIST(self.data, xml_child.xml, selector);
        if ( !result ) {
            throw new Error('grafting to plist "' + filepath + '" during config install went bad :(');
        }
    }
    self.is_changed = true;
}

// ConfigFile.prune_child()
ConfigFile.prototype.prune_child = ConfigFile_prune_child;
function ConfigFile_prune_child(selector, xml_child) {
    var self = this;
    var filepath = self.filepath;
    var result;
    if (self.type === 'xml') {
        var xml_to_graft = [et.XML(xml_child.xml)];
        result = xml_helpers.pruneXML(self.data, xml_to_graft, selector);
    } else {
        // plist file
        result = plist_helpers.prunePLIST(self.data, xml_child.xml, selector);
    }
    if ( !result) {
        var err_msg = 'Pruning at selector "' + selector + '" from "' + filepath + '" went bad.';
        throw new Error(err_msg);
    }
    self.is_changed = true;
}
/**** END of ConfigFile ****/


/******************************************************************************
* Utility functions
******************************************************************************/

// Check if we know such platform
function checkPlatform(platform) {
    if (!(platform in platforms)) throw new Error('platform "' + platform + '" not recognized.');
}

// determine if a plist file is binary
function isBinaryPlist(filename) {
    // I wish there was a synchronous way to read only the first 6 bytes of a
    // file. This is wasteful :/
    var buf = '' + fs.readFileSync(filename, 'utf8');
    // binary plists start with a magic header, "bplist"
    return buf.substring(0, 6) === 'bplist';
}

// Find out the real name of an iOS project
// TODO: glob is slow, need a better way or caching, or avoid using more than once.
function getIOSProjectname(project_dir) {
    var matches = glob.sync(path.join(project_dir, '*.xcodeproj'));
    var iospath;
    if (matches.length === 1) {
        iospath = path.basename(matches[0],'.xcodeproj');
    } else {
        var msg;
        if (matches.length === 0) {
            msg = 'Does not appear to be an xcode project, no xcode project file in ' + project_dir;
        }
        else {
            msg = 'There are multiple *.xcodeproj dirs in ' + project_dir;
        }
        throw new Error(msg);
    }
    return iospath;
}

// Some config-file target attributes are not qualified with a full leading directory, or contain wildcards.
// Resolve to a real path in this function.
// TODO: getIOSProjectname is slow because of glob, try to avoid calling it several times per project.
function resolveConfigFilePath(project_dir, platform, file) {
    var filepath = path.join(project_dir, file);
    var matches;

    // .pbxproj file
    if (file === 'framework') {
        var proj_name = getIOSProjectname(project_dir);
        filepath = path.join(project_dir, proj_name + '.xcodeproj', 'project.pbxproj');
        return filepath;
    }

    if (file.indexOf('*') > -1) {
        // handle wildcards in targets using glob.
        matches = glob.sync(path.join(project_dir, '**', file));
        if (matches.length) filepath = matches[0];
        return filepath;
    }

    // special-case config.xml target that is just "config.xml". This should be resolved to the real location of the file.
    // TODO: move the logic that contains the locations of config.xml from cordova CLI into plugman.
    if (file == 'config.xml') {
        if (platform == 'ubuntu') {
            filepath = path.join(project_dir, 'config.xml');
        } else if (platform == 'ios') {
            var iospath = getIOSProjectname(project_dir);
            filepath = path.join(project_dir,iospath, 'config.xml');
        } else if (platform == 'android') {
            filepath = path.join(project_dir, 'res', 'xml', 'config.xml');
        } else {
            matches = glob.sync(path.join(project_dir, '**', 'config.xml'));
            if (matches.length) filepath = matches[0];
        }
        return filepath;
    }

    // None of the special cases matched, returning project_dir/file.
    return filepath;
}


/******************************************************************************
* Munge object manipulations functions
******************************************************************************/

// add the count of [key1][key2]...[keyN] to obj
// return true if it didn't exist before
function deep_add(obj, keys /* or key1, key2 .... */ ) {
    if ( !Array.isArray(keys) ) {
        keys = Array.prototype.slice.call(arguments, 1);
    }

    return process_munge(obj, true/*createParents*/, function (parentArray, k) {
        var found = _.find(parentArray, function(element) {
            return element.xml == k.xml;
        });
        if (found) {
            found.after = found.after || k.after;
            found.count += k.count;
        } else {
            parentArray.push(k);
        }
        return !found;
    }, keys);
}

// decrement the count of [key1][key2]...[keyN] from obj and remove if it reaches 0
// return true if it was removed or not found
function deep_remove(obj, keys /* or key1, key2 .... */ ) {
    if ( !Array.isArray(keys) ) {
        keys = Array.prototype.slice.call(arguments, 1);
    }

    var result = process_munge(obj, false/*createParents*/, function (parentArray, k) {
        var index = -1;
        var found = _.find(parentArray, function (element) {
            index++;
            return element.xml == k.xml;
        });
        if (found) {
            found.count -= k.count;
            if (found.count > 0) {
                return false;
            }
            else {
                parentArray.splice(index, 1);
            }
        }
        return undefined;
    }, keys);

    return typeof result === 'undefined' ? true : result;
}

// search for [key1][key2]...[keyN]
// return the object or undefined if not found
function deep_find(obj, keys /* or key1, key2 .... */ ) {
    if ( !Array.isArray(keys) ) {
        keys = Array.prototype.slice.call(arguments, 1);
    }

    return process_munge(obj, false/*createParents?*/, function (parentArray, k) {
        return _.find(parentArray, function (element) {
            return element.xml == (k.xml || k);
        });
    }, keys);
}

// Execute func passing it the parent array and the xmlChild key.
// When createParents is true, add the file and parent items  they are missing
// When createParents is false, stop and return undefined if the file and/or parent items are missing

function process_munge(obj, createParents, func, keys /* or key1, key2 .... */ ) {
    if ( !Array.isArray(keys) ) {
        keys = Array.prototype.slice.call(arguments, 1);
    }
    var k = keys[0];
    if (keys.length == 1) {
        return func(obj, k);
    } else if (keys.length == 2) {
        if (!obj.parents[k] && !createParents) {
            return undefined;
        }
        obj.parents[k] = obj.parents[k] || [];
        return process_munge(obj.parents[k], createParents, func, keys.slice(1));
    } else if (keys.length == 3){
        if (!obj.files[k] && !createParents) {
            return undefined;
        }
        obj.files[k] = obj.files[k] || { parents: {} };
        return process_munge(obj.files[k], createParents, func, keys.slice(1));
    } else {
        throw new Error('Invalid key format. Must contain at most 3 elements (file, parent, xmlChild).');
    }
}

// All values from munge are added to base as
// base[file][selector][child] += base[file][selector][child]
// Returns a munge object containing values that exist in munge
// but not in base.
function increment_munge(base, munge) {
    var diff = { files: {} };

    for (var file in munge.files) {
        for (var selector in munge.files[file].parents) {
            for (var xml_child in munge.files[file].parents[selector]) {
                var val = munge.files[file].parents[selector][xml_child];
                // if node not in base, add it to diff and base
                // else increment it's value in base without adding to diff
                var newlyAdded = deep_add(base, [file, selector, val]);
                if (newlyAdded) {
                    deep_add(diff, file, selector, val);
                }
            }
        }
    }
    return diff;
}

// Update the base munge object as
// base[file][selector][child] -= base[file][selector][child]
// nodes that reached zero value are removed from base and added to the returned munge
// object.
function decrement_munge(base, munge) {
    var zeroed = { files: {} };

    for (var file in munge.files) {
        for (var selector in munge.files[file].parents) {
            for (var xml_child in munge.files[file].parents[selector]) {
                var val = munge.files[file].parents[selector][xml_child];
                // if node not in base, add it to diff and base
                // else increment it's value in base without adding to diff
                var removed = deep_remove(base, [file, selector, val]);
                if (removed) {
                    deep_add(zeroed, file, selector, val);
                }
            }
        }
    }
    return zeroed;
}

// For better readability where used
function clone_munge(munge) {
    return increment_munge({}, munge);
}
