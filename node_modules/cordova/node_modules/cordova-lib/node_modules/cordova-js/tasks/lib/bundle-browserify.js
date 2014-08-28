/*
 * Licensed to the Apache Software Foundation (ASF
 * or more contributor license agreements.  See th
 * distributed with this work for additional infor
 * regarding copyright ownership.  The ASF license
 * to you under the Apache License, Version 2.0 (t
 * "License"); you may not use this file except in
 * with the License.  You may obtain a copy of the
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to 
 * software distributed under the License is distr
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * KIND, either express or implied.  See the Licen
 * specific language governing permissions and lim
 * under the License.
 */
var fs           = require('fs');
var path         = require('path');
var browserify   = require('browserify');
var require_tr   = require('./require-tr');
var root         = path.join(__dirname, '..', '..')


module.exports = function bundle(platform, debug, commitId) {
    require_tr.platform = platform;
    // FIXME: need to find a way to void ignore missing
    var b = browserify({debug: debug});
    // XXX plugin_list is not present at this stage 
    b.ignore(path.join(root, 'src', 'common', 'plugin_list'));

    b.transform(require_tr.transform);

    b.add(path.join(root, 'src', platform, 'exec.js'));
    
    b.add(path.join(root, 'src', platform, 'platform.js'));

    b.add(path.join(root, 'src', 'scripts', 'bootstrap.js'));

    return b;
}
