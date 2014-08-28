/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var fs           = require('fs');
var path         = require('path');
var collectFiles = require('./collect-files');
var copyProps    = require('./copy-props');
var writeModule  = require('./write-module');
var writeScript  = require('./write-script');
var licensePath = path.join(__dirname, '..', 'templates', 'LICENSE-for-js-file.txt');

module.exports = function bundle(platform, debug, commitId) {
    var modules = collectFiles(path.join('src', 'common'));
    var scripts = collectFiles(path.join('src', 'scripts'));
    modules[''] = path.join('src', 'cordova.js');
    copyProps(modules, collectFiles(path.join('src', platform)));

    if (platform === 'test') {
        // Add any platform-specific modules that have tests to the test bundle.
        var testFilesPath = path.join('src', 'android', 'android');
        copyProps(modules, collectFiles(testFilesPath, 'android'));
        modules['android/exec'] = path.join('src', 'android' , 'exec.js');
        modules['ios/exec'] = path.join('src', 'ios' , 'exec.js');
    }

    var output = [];
  
    output.push("// Platform: " + platform);
    output.push("// "  + commitId);

    // write header
    output.push('/*', fs.readFileSync(licensePath, 'utf8'), '*/');
    output.push(';(function() {');
    output.push("var CORDOVA_JS_BUILD_LABEL = '"  + commitId + "';");

    // write initial scripts
    if (!scripts['require']) {
        throw new Error("didn't find a script for 'require'")
    }
    
    writeScript(output, scripts['require'], debug)

    // write modules
    var moduleIds = Object.keys(modules)
    moduleIds.sort()
    
    for (var i=0; i<moduleIds.length; i++) {
        var moduleId = moduleIds[i]
       
        writeModule(output, modules[moduleId], moduleId, debug)
    }

    output.push("window.cordova = require('cordova');")

    // write final scripts
    if (!scripts['bootstrap']) {
        throw new Error("didn't find a script for 'bootstrap'")
    }
    
    writeScript(output, scripts['bootstrap'], debug)
    
    var bootstrapPlatform = 'bootstrap-' + platform
    if (scripts[bootstrapPlatform]) {
        writeScript(output, scripts[bootstrapPlatform], debug)
    }

    // write trailer
    output.push('})();')

    return output.join('\n')
}

