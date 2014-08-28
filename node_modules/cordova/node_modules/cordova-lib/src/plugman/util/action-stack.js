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

var platforms = require("../platforms"),
    events = require('../../events'),
    Q = require('q');

function ActionStack() {
    this.stack = [];
    this.completed = [];
}

ActionStack.prototype = {
    createAction:function(handler, action_params, reverter, revert_params) {
        return {
            handler:{
                run:handler,
                params:action_params
            },
            reverter:{
                run:reverter,
                params:revert_params
            }
        };
    },
    push:function(tx) {
        this.stack.push(tx);
    },
    // Returns a promise.
    process:function(platform, project_dir) {
        events.emit('verbose', 'Beginning processing of action stack for ' + platform + ' project...');
        var project_files;

        // parse platform-specific project files once
        if (platforms[platform].parseProjectFile) {
            events.emit('verbose', 'Parsing ' + platform + ' project files...');
            project_files = platforms[platform].parseProjectFile(project_dir);
        }

        while(this.stack.length) {
            var action = this.stack.shift();
            var handler = action.handler.run;
            var action_params = action.handler.params;
            if (project_files) {
                action_params.push(project_files);
            }

            try {
                handler.apply(null, action_params);
            } catch(e) {
                events.emit('warn', 'Error during processing of action! Attempting to revert...');
                this.stack.unshift(action);
                var issue = 'Uh oh!\n';
                // revert completed tasks
                while(this.completed.length) {
                    var undo = this.completed.shift();
                    var revert = undo.reverter.run;
                    var revert_params = undo.reverter.params;

                    if (project_files) {
                        revert_params.push(project_files);
                    }

                    try {
                        revert.apply(null, revert_params);
                    } catch(err) {
                        events.emit('warn', 'Error during reversion of action! We probably really messed up your project now, sorry! D:');
                        issue += 'A reversion action failed: ' + err.message + '\n';
                    }
                }
                e.message = issue + e.message;
                return Q.reject(e);
            }
            this.completed.push(action);
        }
        events.emit('verbose', 'Action stack processing complete.');

        if (project_files) {
            events.emit('verbose', 'Writing out ' + platform + ' project files...');
            project_files.write();
        }

        return Q();
    }
};

module.exports = ActionStack;
