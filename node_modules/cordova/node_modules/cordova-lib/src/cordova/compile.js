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

var path              = require('path'),
    cordova_util      = require('./util'),
    hooker            = require('./hooker'),
    superspawn        = require('./superspawn');

// Returns a promise.
module.exports = function compile(options) {
    var projectRoot = cordova_util.cdProjectRoot();
    options = cordova_util.preProcessOptions(options);

    var hooks = new hooker(projectRoot);
    var ret = hooks.fire('before_compile', options);
    options.platforms.forEach(function(platform) {
        ret = ret.then(function() {
            var cmd = path.join(projectRoot, 'platforms', platform, 'cordova', 'build');
            return superspawn.spawn(cmd, options.options, { stdio: 'inherit', printCommand: true });
        });
    });
    ret = ret.then(function() {
        return hooks.fire('after_compile', options);
    });
    return ret;
};
