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
var fs                 = require('fs');
var path               = require('path');
var util               = require('util');
var bundle             = require('./bundle-browserify');
var computeCommitId    = require('./compute-commit-id');
var writeLicenseHeader = require('./write-license-header');


module.exports = function generate(platform, useWindowsLineEndings, done) {
    computeCommitId(function(commitId) {
        var outReleaseFile, outReleaseFileStream,
            outDebugFile, outDebugFileStream,
            releaseBundle, debugBundle;
        var time = new Date().valueOf();

        var libraryRelease = bundle(platform, false, commitId);
       // if we are using windows line endings, we will also add the BOM
       // if(useWindowsLineEndings) {
       //     libraryRelease = "\ufeff" + libraryRelease.split(/\r?\n/).join("\r\n");
       // }
       // var libraryDebug   = bundle(platform, true, commitId);

        if (!fs.existsSync('pkg')) {
            fs.mkdirSync('pkg');
        }
       // if(!fs.existsSync('pkg/debug')) {
       //     fs.mkdirSync('pkg/debug');
       // }

        outReleaseFile = path.join('pkg', 'cordova.' + platform + '.js');
        outReleaseFileStream = fs.createWriteStream(outReleaseFile);
        
        // write license header
        writeLicenseHeader(outReleaseFileStream, platform, commitId);

        releaseBundle = libraryRelease.bundle();

        releaseBundle.pipe(outReleaseFileStream);

        outReleaseFileStream.on('finish', function() {
          var newtime = new Date().valueOf() - time;
          console.log('generated cordova.' + platform + '.js @ ' + commitId + ' in ' + newtime + 'ms');
          done();
        });

       // outDebugFile = path.join('pkg', 'debug', 'cordova.' + platform + '-debug.js');
       // outDebugFileStream = fs.createWriteStream(outDebugFile);
       // debugBundle = libraryDebug.bundle();
       // debugBundle.pipe(outDebugFileStream);

       // outDebugFileStream.on('end', function() {
       //   var newtime = new Date().valueOf() - time;
       //   console.log('generated cordova.' + platform + '-debug.js @ ' + commitId + ' in ' + newtime + 'ms');
       // });
    });
}
