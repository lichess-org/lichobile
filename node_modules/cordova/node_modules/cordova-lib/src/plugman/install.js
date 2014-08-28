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
          laxcomma:true, sub:true, expr:true
*/

var path = require('path'),
    fs   = require('fs'),
    action_stack = require('./util/action-stack'),
    dep_graph = require('dep-graph'),
    child_process = require('child_process'),
    semver = require('semver'),
    config_changes = require('./util/config-changes'),
    PluginInfo    = require('../PluginInfo'),
    CordovaError  = require('../CordovaError'),
    Q = require('q'),
    platform_modules = require('./platforms'),
    os = require('os'),
    underscore = require('underscore'),
    shell   = require('shelljs'),
    events = require('../events'),
    plugman = require('./plugman'),
    isWindows = (os.platform().substr(0,3) === 'win');

/* INSTALL FLOW
   ------------
   There are four functions install "flows" through. Here is an attempt at
   providing a high-level logic flow overview.
   1. module.exports (installPlugin)
     a) checks that the platform is supported
     b) invokes possiblyFetch
   2. possiblyFetch
     a) checks that the plugin is fetched. if so, calls runInstall
     b) if not, invokes plugman.fetch, and when done, calls runInstall
   3. runInstall
     a) checks if the plugin is already installed. if so, calls back (done).
     b) if possible, will check the version of the project and make sure it is compatible with the plugin (checks <engine> tags)
     c) makes sure that any variables required by the plugin are specified. if they are not specified, plugman will throw or callback with an error.
     d) if dependencies are listed in the plugin, it will recurse for each dependent plugin and call possiblyFetch (2) on each one. When each dependent plugin is successfully installed, it will then proceed to call handleInstall (4)
   4. handleInstall
     a) queues up actions into a queue (asset, source-file, headers, etc)
     b) processes the queue
     c) calls back (done)
*/

// possible options: subdir, cli_variables, www_dir
// Returns a promise.
module.exports = function installPlugin(platform, project_dir, id, plugins_dir, options) {
    options = options || {};
    options.is_top_level = true;
    plugins_dir = plugins_dir || path.join(project_dir, 'cordova', 'plugins');

    if (!platform_modules[platform]) {
        return Q.reject(new CordovaError(platform + ' not supported.'));
    }

    var current_stack = new action_stack();

    return possiblyFetch(id, plugins_dir, options)
    .then(function(plugin_dir) {
        return runInstall(current_stack, platform, project_dir, plugin_dir, plugins_dir, options);
    });
};

// possible options: subdir, cli_variables, www_dir, git_ref, is_top_level
// Returns a promise.
function possiblyFetch(id, plugins_dir, options) {

    // if plugin is a relative path, check if it already exists
    var plugin_src_dir = path.join(plugins_dir, id);
    if( isAbsolutePath(id) )
        plugin_src_dir = id;

    // Check that the plugin has already been fetched.
    if (fs.existsSync(plugin_src_dir)) {
        return Q(plugin_src_dir);
    }

    var opts = underscore.extend({}, options, {
        link: false,
        client: 'plugman'
    });

    // if plugin doesnt exist, use fetch to get it.
    return plugman.raw.fetch(id, plugins_dir, opts);
}

function checkEngines(engines) {

    for(var i = 0; i < engines.length; i++) {
        var engine = engines[i];

        if ( semver.satisfies(engine.currentVersion, engine.minVersion) || engine.currentVersion === null ) {
            // engine ok!
        } else {
            var msg = 'Plugin doesn\'t support this project\'s ' + engine.name + ' version. ' +
                      engine.name + ': ' + engine.currentVersion +
                      ', failed version requirement: ' + engine.minVersion;
            return Q.reject(new CordovaError(msg));
        }
    }

    return Q(true);
}

function cleanVersionOutput(version, name){
    var out = version.trim();
    var rc_index = out.indexOf('rc');
    var dev_index = out.indexOf('dev');
    if (rc_index > -1) {
        out = out.substr(0, rc_index) + '-' + out.substr(rc_index);
    }

    // put a warning about using the dev branch
    if (dev_index > -1) {
        // some platform still lists dev branches as just dev, set to null and continue
        if(out=='dev'){
            out = null;
        }
        events.emit('verbose', name+' has been detected as using a development branch. Attemping to install anyways.');
    }

    // add extra period/digits to conform to semver - some version scripts will output
    // just a major or major minor version number
    var majorReg = /\d+/,
        minorReg = /\d+\.\d+/,
        patchReg = /\d+\.\d+\.\d+/;

    if(patchReg.test(out)){

    }else if(minorReg.test(out)){
        out = out.match(minorReg)[0]+'.0';
    }else if(majorReg.test(out)){
        out = out.match(majorReg)[0]+'.0.0';
    }

    return out;
}

// exec engine scripts in order to get the current engine version
// Returns a promise for the array of engines.
function callEngineScripts(engines) {

    return Q.all(
        engines.map(function(engine){
            // CB-5192; on Windows scriptSrc doesn't have file extension so we shouldn't check whether the script exists

            var scriptPath = engine.scriptSrc ? '"' + engine.scriptSrc + '"' : null;

            if(scriptPath && (isWindows || fs.existsSync(engine.scriptSrc)) ) {

                var d = Q.defer();
                if(!isWindows) { // not required on Windows
                    fs.chmodSync(engine.scriptSrc, '755');
                }
                child_process.exec(scriptPath, function(error, stdout, stderr) {
                    if (error) {
                        events.emit('warn', engine.name +' version check failed ('+ scriptPath +'), continuing anyways.');
                        engine.currentVersion = null;
                    } else {
                        engine.currentVersion = cleanVersionOutput(stdout, engine.name);
                    }

                    d.resolve(engine);
                });
                return d.promise;

            } else {

                if(engine.currentVersion) {
                    engine.currentVersion = cleanVersionOutput(engine.currentVersion, engine.name);
                } else {
                    events.emit('warn', engine.name +' version not detected (lacks script '+ scriptPath +' ), continuing.');
                }

                return Q(engine);
            }
        })
    );
}

// return only the engines we care about/need
function getEngines(pluginElement, platform, project_dir, plugin_dir){
    var engines = pluginElement.findall('engines/engine');
    var defaultEngines = require('./util/default-engines')(project_dir);
    var uncheckedEngines = [];
    var cordovaEngineIndex, cordovaPlatformEngineIndex, theName, platformIndex, defaultPlatformIndex;
    // load in known defaults and update when necessary

    engines.forEach(function(engine){
        theName = engine.attrib['name'];

        // check to see if the engine is listed as a default engine
        if(defaultEngines[theName]){
            // make sure engine is for platform we are installing on
            defaultPlatformIndex = defaultEngines[theName].platform.indexOf(platform);
            if(defaultPlatformIndex > -1 || defaultEngines[theName].platform === '*'){
                defaultEngines[theName].minVersion = defaultEngines[theName].minVersion ? defaultEngines[theName].minVersion : engine.attrib['version'];
                defaultEngines[theName].currentVersion = defaultEngines[theName].currentVersion ? defaultEngines[theName].currentVersion : null;
                defaultEngines[theName].scriptSrc = defaultEngines[theName].scriptSrc ? defaultEngines[theName].scriptSrc : null;
                defaultEngines[theName].name = theName;

                // set the indices so we can pop the cordova engine when needed
                if(theName==='cordova') cordovaEngineIndex = uncheckedEngines.length;
                if(theName==='cordova-'+platform) cordovaPlatformEngineIndex = uncheckedEngines.length;

                uncheckedEngines.push(defaultEngines[theName]);
            }
        // check for other engines
        }else{
            platformIndex = engine.attrib['platform'].indexOf(platform);
            if(platformIndex > -1 || engine.attrib['platform'] === '*'){
                uncheckedEngines.push({ 'name': theName, 'platform': engine.attrib['platform'], 'scriptSrc':path.resolve(plugin_dir, engine.attrib['scriptSrc']), 'minVersion' :  engine.attrib['version']});
            }
        }
    });

    // make sure we check for platform req's and not just cordova reqs
    if(cordovaEngineIndex && cordovaPlatformEngineIndex) uncheckedEngines.pop(cordovaEngineIndex);
    return uncheckedEngines;
}


function isPluginInstalled(plugins_dir, platform, plugin_id) {
    var installed_plugin_id;
    var platform_config = config_changes.get_platform_json(plugins_dir, platform);
    for (installed_plugin_id in platform_config.installed_plugins) {
        if (installed_plugin_id == plugin_id) {
            return true;
        }
    }
    for (installed_plugin_id in platform_config.dependent_plugins) {
        if (installed_plugin_id == plugin_id) {
            return true;
        }
    }
    return false;
}

// possible options: cli_variables, www_dir, is_top_level
// Returns a promise.
module.exports.runInstall = runInstall;
function runInstall(actions, platform, project_dir, plugin_dir, plugins_dir, options) {
    var pluginInfo   = new PluginInfo.PluginInfo(plugin_dir)
      , filtered_variables = {};

    options = options || {};
    options.graph = options.graph || new dep_graph();

    if (isPluginInstalled(plugins_dir, platform, pluginInfo.id)) {
        if (options.is_top_level) {
            events.emit('results', 'Plugin "' + pluginInfo.id + '" already installed on ' + platform + '.');
        } else {
            events.emit('verbose', 'Dependent plugin "' + pluginInfo.id + '" already installed on ' + platform + '.');
        }
        return Q();
    }
    events.emit('log', 'Installing "' + pluginInfo.id + '" for ' + platform);

    var theEngines = getEngines(pluginInfo._et, platform, project_dir, plugin_dir);

    var install = {
        actions: actions,
        platform: platform,
        project_dir: project_dir,
        plugins_dir: plugins_dir,
        top_plugin_id: pluginInfo.id,
        top_plugin_dir: plugin_dir
    };

    return callEngineScripts(theEngines)
    .then(checkEngines)
    .then(
        function() {
            // checking preferences, if certain variables are not provided, we should throw.
            var prefs = pluginInfo.getPreferences(platform);
            options.cli_variables = options.cli_variables || {};
            filtered_variables = underscore.pick(options.cli_variables, prefs);
            var missing_vars = underscore.difference(prefs, Object.keys(options.cli_variables));
            install.filtered_variables = filtered_variables;

            if (missing_vars.length > 0) {
                throw new Error('Variable(s) missing: ' + missing_vars.join(', '));
            }

            // Check for dependencies
            var dependencies = pluginInfo.getDependencies(platform);
            if(dependencies.length) {
                return installDependencies(install, dependencies, options);
            }
            return Q(true);
        }
    ).then(
        function(){
            var install_plugin_dir = path.join(plugins_dir, pluginInfo.id);

            // may need to copy to destination...
            if ( !fs.existsSync(install_plugin_dir) ) {
                copyPlugin(plugin_dir, plugins_dir, options.link);
            }

            return handleInstall(actions, pluginInfo, platform, project_dir, plugins_dir, install_plugin_dir, filtered_variables, options);
        }
    ).fail(
        function (error) {
            events.emit('warn', 'Failed to install \'' + pluginInfo.id + '\':' + error.stack);
            throw error;
        }
    );
}

function installDependencies(install, dependencies, options) {
    events.emit('verbose', 'Dependencies detected, iterating through them...');

    var top_plugins = path.join(options.plugin_src_dir || install.top_plugin_dir, '..');

    // Add directory of top-level plugin to search path
    options.searchpath = options.searchpath || [];
    if( top_plugins != install.plugins_dir && options.searchpath.indexOf(top_plugins) == -1 )
        options.searchpath.push(top_plugins);

    // Search for dependency by Id is:
    // a) Look for {$top_plugins}/{$depId} directory
    // b) Scan the top level plugin directory {$top_plugins} for matching id (searchpath)
    // c) Fetch from registry

    return dependencies.reduce(function(soFar, dep) {
        return soFar.then(
            function() {
                dep.git_ref = dep.commit;

                if (dep.subdir) {
                    dep.subdir = path.normalize(dep.subdir);
                }

                // We build the dependency graph only to be able to detect cycles, getChain will throw an error if it detects one
                options.graph.add(install.top_plugin_id, dep.id);
                options.graph.getChain(install.top_plugin_id);

                return tryFetchDependency(dep, install, options)
                .then(
                    function(url){
                        dep.url = url;
                        return installDependency(dep, install, options);
                    }
                );
            }
        );

    }, Q(true));
}

function tryFetchDependency(dep, install, options) {

    // Handle relative dependency paths by expanding and resolving them.
    // The easy case of relative paths is to have a URL of '.' and a different subdir.
    // TODO: Implement the hard case of different repo URLs, rather than the special case of
    // same-repo-different-subdir.
    var relativePath;
    if ( dep.url == '.' ) {

        // Look up the parent plugin's fetch metadata and determine the correct URL.
        var fetchdata = require('./util/metadata').get_fetch_metadata(install.top_plugin_dir);
        if (!fetchdata || !(fetchdata.source && fetchdata.source.type)) {

            relativePath = dep.subdir || dep.id;

            events.emit('warn', 'No fetch metadata found for plugin ' + install.top_plugin_id + '. checking for ' + relativePath + ' in '+ options.searchpath.join(','));

            return Q(relativePath);
        }

        // Now there are two cases here: local directory, and git URL.
        var d = Q.defer();

        if (fetchdata.source.type === 'local') {

            dep.url = fetchdata.source.path;

            child_process.exec('git rev-parse --show-toplevel', { cwd:dep.url }, function(err, stdout, stderr) {
                if (err) {
                    if (err.code == 128) {
                        return d.reject(new Error('Plugin ' + dep.id + ' is not in git repository. All plugins must be in a git repository.'));
                    } else {
                        return d.reject(new Error('Failed to locate git repository for ' + dep.id + ' plugin.'));
                    }
                }
                return d.resolve(stdout.trim());
            });

            return d.promise.then(function(git_repo) {
                //Clear out the subdir since the url now contains it
                var url = path.join(git_repo, dep.subdir);
                dep.subdir = '';
                return Q(url);
            }).fail(function(error){
//console.log("Failed to resolve url='.': " + error);
                return Q(dep.url);
            });

        } else if (fetchdata.source.type === 'git') {
            return Q(fetchdata.source.url);
        } else if (fetchdata.source.type === 'dir') {

            // Note: With fetch() independant from install()
            // $md5 = md5(uri)
            // Need a Hash(uri) --> $tmpDir/cordova-fetch/git-hostname.com-$md5/
            // plugin[id].install.source --> searchpath that matches fetch uri

            // mapping to a directory of OS containing fetched plugins
            var tmpDir = fetchdata.source.url;
            tmpDir = tmpDir.replace('$tmpDir', os.tmpdir());

            var pluginSrc = '';
            if(dep.subdir.length) {
                // Plugin is relative to directory
                pluginSrc = path.join(tmpDir, dep.subdir);
            }

            // Try searchpath in dir, if that fails re-fetch
            if( !pluginSrc.length || !fs.existsSync(pluginSrc) ) {
                pluginSrc = dep.id;

                // Add search path
                if( options.searchpath.indexOf(tmpDir) == -1 )
                    options.searchpath.unshift(tmpDir); // place at top of search
            }

            return Q( pluginSrc );
        }
    }

    // Test relative to parent folder
    if( dep.url && isRelativePath(dep.url) ) {
        relativePath = path.resolve(install.top_plugin_dir, '../' + dep.url);

        if( fs.existsSync(relativePath) ) {
            dep.url = relativePath;
        }
    }

    // CB-4770: registry fetching
    if(dep.url === undefined) {
        dep.url = dep.id;
    }

    return Q(dep.url);
}

function installDependency(dep, install, options) {

    var opts;

    dep.install_dir = path.join(install.plugins_dir, dep.id);

    if ( fs.existsSync(dep.install_dir) ) {
        events.emit('verbose', 'Dependent plugin "' + dep.id + '" already fetched, using that version.');
        opts = underscore.extend({}, options, {
            cli_variables: install.filtered_variables,
            is_top_level: false
        });

        return runInstall(install.actions, install.platform, install.project_dir, dep.install_dir, install.plugins_dir, opts);

    } else {
        events.emit('verbose', 'Dependent plugin "' + dep.id + '" not fetched, retrieving then installing.');

        opts = underscore.extend({}, options, {
            cli_variables: install.filtered_variables,
            is_top_level: false,
            subdir: dep.subdir,
            git_ref: dep.git_ref,
            expected_id: dep.id
        });

        var dep_src = dep.url.length ? dep.url : dep.id;

        return possiblyFetch(dep_src, install.plugins_dir, opts)
        .then(
            function(plugin_dir) {
                return runInstall(install.actions, install.platform, install.project_dir, plugin_dir, install.plugins_dir, opts);
            }
        );
    }
}

function handleInstall(actions, pluginInfo, platform, project_dir, plugins_dir, plugin_dir, filtered_variables, options) {

    // @tests - important this event is checked spec/install.spec.js
    events.emit('verbose', 'Install start for "' + pluginInfo.id + '" on ' + platform + '.');

    var handler = platform_modules[platform];

    var platformTag = pluginInfo._et.find('./platform[@name="'+platform+'"]');
    if ( pluginInfo.hasPlatformSection(platform) ) {
        var sourceFiles = platformTag.findall('./source-file'),
            headerFiles = platformTag.findall('./header-file'),
            resourceFiles = platformTag.findall('./resource-file'),
            frameworkFiles = platformTag.findall('./framework'),
            libFiles = platformTag.findall('./lib-file');


        // queue up native stuff
        sourceFiles && sourceFiles.forEach(function(item) {
            actions.push(actions.createAction(handler['source-file'].install,
                                              [item, plugin_dir, project_dir, pluginInfo.id],
                                              handler['source-file'].uninstall,
                                              [item, project_dir, pluginInfo.id]));
        });

        headerFiles && headerFiles.forEach(function(item) {
            actions.push(actions.createAction(handler['header-file'].install,
                                             [item, plugin_dir, project_dir, pluginInfo.id],
                                             handler['header-file'].uninstall,
                                             [item, project_dir, pluginInfo.id]));
        });

        resourceFiles && resourceFiles.forEach(function(item) {
            actions.push(actions.createAction(handler['resource-file'].install,
                                              [item, plugin_dir, project_dir, pluginInfo.id],
                                              handler['resource-file'].uninstall,
                                              [item, project_dir, pluginInfo.id]));
        });
        // CB-5238 custom frameworks only
        frameworkFiles && frameworkFiles.forEach(function(item) {
            actions.push(actions.createAction(handler['framework'].install,
                                             [item, plugin_dir, project_dir, pluginInfo.id],
                                             handler['framework'].uninstall,
                                             [item, project_dir, pluginInfo.id]));
        });

        libFiles && libFiles.forEach(function(item) {
            actions.push(actions.createAction(handler['lib-file'].install,
                                                [item, plugin_dir, project_dir, pluginInfo.id],
                                                handler['lib-file'].uninstall,
                                                [item, project_dir, pluginInfo.id]));

        });
    }

    // run through the action stack
    return actions.process(platform, project_dir)
    .then(function(err) {
        // queue up the plugin so prepare knows what to do.
        config_changes.add_installed_plugin_to_prepare_queue(plugins_dir, pluginInfo.id, platform, filtered_variables, options.is_top_level);
        // call prepare after a successful install
        plugman.prepare(project_dir, platform, plugins_dir, options.www_dir, options.is_top_level);

        events.emit('verbose', 'Install complete for ' + pluginInfo.id + ' on ' + platform + '.');
        // WIN!
        // Log out plugin INFO element contents in case additional install steps are necessary
        var info_strings = pluginInfo.getInfo(platform) || [];
        info_strings.forEach( function(info) {
            events.emit('results', interp_vars(filtered_variables, info));
        });
    });
}

function interp_vars(vars, text) {
    vars && Object.keys(vars).forEach(function(key) {
        var regExp = new RegExp('\\$' + key, 'g');
        text = text.replace(regExp, vars[key]);
    });
    return text;
}

function isAbsolutePath(path) {
    return path && (path[0] === '/' || path[0] === '\\' || path.indexOf(':\\') > 0 );
}

function isRelativePath(path) {
    return !isAbsolutePath();
}

// Copy or link a plugin from plugin_dir to plugins_dir/plugin_id.
function copyPlugin(plugin_src_dir, plugins_dir, link) {
    var pluginInfo = new PluginInfo.PluginInfo(plugin_src_dir);
    var dest = path.join(plugins_dir, pluginInfo.id);
    shell.rm('-rf', dest);

    if (link) {
        events.emit('verbose', 'Symlinking from location "' + plugin_src_dir + '" to location "' + dest + '"');
        fs.symlinkSync(plugin_src_dir, dest, 'dir');
    } else {
        shell.mkdir('-p', dest);
        events.emit('verbose', 'Copying from location "' + plugin_src_dir + '" to location "' + dest + '"');
        shell.cp('-R', path.join(plugin_src_dir, '*') , dest);
    }

    return dest;
}
