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
          quotmark:false
*/

var util = require('util');

// FIXME this is extremely guettho
module.exports = prepare_namespace;
function prepare_namespace(target, method) {
    var old = target;
    target = target.replace(/^window(\.)?/, '');

    var lastDot = target.lastIndexOf('.');
    var lastName = target.substr(lastDot + 1);
    var props = target.split('.');
    var code = '';

    if(target !== '') {
        for(var i = 1, len = props.length ; i <= len ; i++) {
            var sub = props.slice(0, i).join('.');
            code += util.format('window.%s = window.%s || {};\n', sub, sub);
        }
    }

    props.unshift('window');
    var object = props.slice(0, props.length - 1).join('.');
    //  code = '\n';
    if(method === 'c') {
        return util.format(
                "%s\nrequire('cordova/builder').assignOrWrapInDeprecateGetter(%s, '%s', module.exports);",
                code,
                object,
                lastName
                );
    } else if(method === 'm' && old !== '') {
        return util.format(
                "%s\n;require('cordova/builder').recursiveMerge(%s, module.exports);",
                code,
                old
                );
    } else {
        return '// no clobber or merges';
    }
}
