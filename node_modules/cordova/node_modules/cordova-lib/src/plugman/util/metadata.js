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

var fs = require('fs'),
    path = require('path');

var filename = '.fetch.json';

exports.get_fetch_metadata = function(plugin_dir) {
    var filepath = path.join(plugin_dir, filename);
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } else {
        return {};
    }
};

exports.save_fetch_metadata = function(plugin_dir, data) {
    var filepath = path.join(plugin_dir, '.fetch.json');
    fs.writeFileSync(filepath, JSON.stringify(data), 'utf-8');
};

