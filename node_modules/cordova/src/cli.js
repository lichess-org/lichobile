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
          laxcomma:true
*/


var path = require('path')
,   help = require('./help')
,   fs = require('fs');

// nopt and underscore are require()d in try-catch below to print a nice error
// message if one of them is not installed.
var nopt, _;


module.exports = cli;
function cli(inputArgs) {

    try {
        nopt = require('nopt');
        _ = require('underscore');
    } catch (e) {
        console.error(
            'Please run npm install from this directory:\n\t' +
            path.dirname(__dirname)
        );
        process.exit(2);
    }

    // When changing command line arguments, update doc/help.txt accordingly.
    var knownOpts =
        { 'verbose' : Boolean
        , 'version' : Boolean
        , 'help' : Boolean
        , 'silent' : Boolean
        , 'experimental' : Boolean
        , 'noregistry' : Boolean
        , 'shrinkwrap' : Boolean
        , 'usenpm' : Boolean
        , 'copy-from' : String
        , 'link-to' : path
        , 'searchpath' : String
        , 'variable' : Array
        // Flags to be passed to `cordova build/run/emulate`
        , 'debug' : Boolean
        , 'release' : Boolean
        , 'archs' : String
        , 'device' : Boolean
        , 'emulator': Boolean
        , 'target' : String
        };

    var shortHands =
        { 'd' : '--verbose'
        , 'v' : '--version'
        , 'h' : '--help'
        , 'src' : '--copy-from'
        };

    // If no inputArgs given, use process.argv.
    inputArgs = inputArgs || process.argv;
    var args = nopt(knownOpts, shortHands, inputArgs);

    if (args.version) {
        console.log( require('../package').version );
        return;
    }

    var cordova_lib = require('cordova-lib'),
        CordovaError = cordova_lib.CordovaError,
        cordova = cordova_lib.cordova,
        events = cordova_lib.events;


    // For CordovaError print only the message without stack trace unless we
    // are in a verbose mode.
    process.on('uncaughtException', function(err){
        if ( (err instanceof CordovaError) && !args.verbose ) {
            console.error(err.message);
        } else {
            console.error(err.stack);
        }
        process.exit(1);
    });


    // Set up event handlers for logging and results emitted as events.
    events.on('results', console.log);

    if ( !args.silent ) {
        events.on('log', console.log);
        events.on('warn', console.warn);
    }

    // Add handlers for verbose logging.
    if (args.verbose) {
        events.on('verbose', console.log);
    }

    // TODO: Example wanted, is this functionality ever used?
    // If there were arguments protected from nopt with a double dash, keep
    // them in unparsedArgs. For example:
    // cordova build ios -- --verbose --whatever
    // In this case "--verbose" is not parsed by nopt and args.vergbose will be
    // false, the unparsed args after -- are kept in unparsedArgs and can be
    // passed downstream to some scripts invoked by Cordova.
    var unparsedArgs = [];
    var parseStopperIdx =  args.argv.original.indexOf('--');
    if (parseStopperIdx != -1) {
        unparsedArgs = args.argv.original.slice(parseStopperIdx + 1);
    }

    // args.argv.remain contains both the undashed args (like platform names)
    // and whatever unparsed args that were protected by " -- ".
    // "undashed" stores only the undashed args without those after " -- " .
    var remain = args.argv.remain;
    var undashed = remain.slice(0, remain.length - unparsedArgs.length);
    var cmd = undashed[0];
    var subcommand;
    var msg;
    var known_platforms = Object.keys(cordova_lib.cordova_platforms);

    if ( !cmd || cmd == 'help' || args.help ) {
        return help();
    }

    if ( !cordova.hasOwnProperty(cmd) ) {
        msg =
            'Cordova does not know ' + cmd + '; try `' + cordova_lib.binname +
            ' help` for a list of all the available commands.';
        throw new CordovaError(msg);
    }

    var opts = {
        platforms: [],
        options: [],
        verbose: args.verbose || false,
        silent: args.silent || false,
    };


    if (cmd == 'emulate' || cmd == 'build' || cmd == 'prepare' || cmd == 'compile' || cmd == 'run') {
        // All options without dashes are assumed to be platform names
        opts.platforms = undashed.slice(1);
        var badPlatforms = _.difference(opts.platforms, known_platforms);
        if( !_.isEmpty(badPlatforms) ) {
            msg = 'Unknown platforms: ' + badPlatforms.join(', ');
            throw new CordovaError(msg);
        }

        // Reconstruct the args to be passed along to platform scripts.
        // This is an ugly temporary fix. The code spawning or otherwise
        // calling into platform code should be dealing with this based
        // on the parsed args object.
        var downstreamArgs = [];
        var argNames = [ 'debug', 'release', 'device', 'emulator' ];
        argNames.forEach(function(flag) {
            if (args[flag]) {
                downstreamArgs.push('--' + flag);
            }
        });
        if (args.target) {
            downstreamArgs.push('--target=' + args.target);
        }
        if (args.archs) {
            downstreamArgs.push('--archs=' + args.archs);
        }
        opts.options = downstreamArgs.concat(unparsedArgs);

        cordova.raw[cmd].call(null, opts).done();
    } else if (cmd == 'serve') {
        var port = undashed[1];
        cordova.raw.serve(port).done();
    } else if (cmd == 'create') {
        var cfg = {};
        // If we got a fourth parameter, consider it to be JSON to init the config.
        if ( undashed[4] ) {
            cfg = JSON.parse(undashed[4]);
        }
        var customWww = args['copy-from'] || args['link-to'];
        if (customWww) {
            if (customWww.indexOf('http') === 0) {
                throw new CordovaError(
                    'Only local paths for custom www assets are supported.'
                );
            }
            if ( customWww.substr(0,1) === '~' ) {  // resolve tilde in a naive way.
                customWww = path.join(process.env.HOME,  customWww.substr(1));
            }
            customWww = path.resolve(customWww);
            var wwwCfg = { uri: customWww };
            if (args['link-to']) {
                wwwCfg.link = true;
            }
            cfg.lib = cfg.lib || {};
            cfg.lib.www = wwwCfg;
        }
        // create(dir, id, name, cfg)
        cordova.raw.create( undashed[1]  // dir to create the project in
                          , undashed[2]  // App id
                          , undashed[3]  // App name
                          , cfg
        ).done();
    } else if ( cmd == 'save' || cmd == 'restore') {
        if ( !args.experimental ) {
            msg =
                'save and restore commands are experimental, please ' +
                'add "--experimental" to indicate that you understand that ' +
                'it may change in the future';
            throw new CordovaError(msg);
        }
        subcommand  = undashed[1];
        if (subcommand == 'plugins') {
            cordova.raw[cmd].call(null, 'plugins', { shrinkwrap:args.shrinkwrap });
        } else {
            msg =
                'Let cordova know what you want to '+ cmd +
                ', try "cordova '+ cmd +' plugins"';
            throw new CordovaError(msg);
        }
    } else {
        // platform/plugins add/rm [target(s)]
        subcommand = undashed[1]; // sub-command like "add", "ls", "rm" etc.
        var targets = undashed.slice(2); // array of targets, either platforms or plugins
        var cli_vars = {};
        if (args.variable) {
            args.variable.forEach( function(s) {
                var keyval = s.split('=');
                var key = keyval[0].toUpperCase();
                cli_vars[key] = keyval[1];
            });
        }
        var download_opts = { searchpath : args.searchpath
                            , noregistry : args.noregistry
                            , usenpm : args.usenpm
                            , cli_variables : cli_vars
                            };
        cordova.raw[cmd](subcommand, targets, download_opts).done();
    }
}
