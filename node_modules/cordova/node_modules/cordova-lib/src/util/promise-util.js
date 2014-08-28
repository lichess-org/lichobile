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

var Q = require('q');

// Given a function and an array of values, creates a chain of promises that
// will sequentially execute func(args[i]).
// Returns a promise.
//
function Q_chainmap(args, func) {
    return Q.when().then(function(inValue) {
        return args.reduce(function(soFar, arg) {
            return soFar.then(function(val) {
                return func(arg, val);
            });
        }, Q(inValue));
    });
}

exports.Q_chainmap = Q_chainmap;
