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

/*global require: true, module: true, process: true*/
/*jslint sloppy: true, white: true, newcap: true */

var cordova_util      = require('./util'),
    path              = require('path'),
    hooker            = require('./hooker'),
    superspawn        = require('./superspawn'),
    Q                 = require('q');

// Returns a promise.
module.exports = function run(options) {
    var projectRoot = cordova_util.cdProjectRoot(),
    options = cordova_util.preProcessOptions(options);

    var hooks = new hooker(projectRoot);
    return hooks.fire('before_run', options)
    .then(function() {
        // Run a prepare first, then shell out to run
        return require('./cordova').raw.prepare(options.platforms)
    }).then(function() {
        // Deploy in parallel (output gets intermixed though...)
        return Q.all(options.platforms.map(function(platform) {
            var cmd = path.join(projectRoot, 'platforms', platform, 'cordova', 'run');
            return superspawn.spawn(cmd, options.options, { printCommand: true, stdio: 'inherit' });
        }));
    }).then(function() {
        return hooks.fire('after_run', options);
    });
};
