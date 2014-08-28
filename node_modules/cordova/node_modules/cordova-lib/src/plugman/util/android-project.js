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
/*
    Helper for Android projects configuration
*/

/* jshint node:true, bitwise:true, undef:true, trailing:true, quotmark:true,
          indent:4, unused:vars, latedef:nofunc,
          boss:true
*/

var fs = require('fs'),
    path = require('path'),
    properties_parser = require('properties-parser'),
    shell = require('shelljs');


function addLibraryReference(projectProperties, libraryPath) {
    var i = 1;
    while (projectProperties.get('android.library.reference.' + i))
        i++;

    projectProperties.set('android.library.reference.' + i, libraryPath);
}

function removeLibraryReference(projectProperties, libraryPath) {
    var i = 1;
    var currentLib;
    while (currentLib = projectProperties.get('android.library.reference.' + i)) {
        if (currentLib === libraryPath) {
            while (currentLib = projectProperties.get('android.library.reference.' + (i + 1))) {
                projectProperties.set('android.library.reference.' + i, currentLib);
                i++;
            }
            projectProperties.set('android.library.reference.' + i);
            break;
        }
        i++;
    }
}

function AndroidProject() {
    this._propertiesEditors = {};
    this._subProjectDirs = {};
    this._dirty = false;

    return this;
}

AndroidProject.prototype = {
    addSubProject: function(parentDir, subDir) {
        var subProjectFile = path.resolve(subDir, 'project.properties');
        if (!fs.existsSync(subProjectFile)) throw new Error('cannot find "' + subProjectFile + '" referenced in <framework>');

        var parentProjectFile = path.resolve(parentDir, 'project.properties');
        var parentProperties = this._getPropertiesFile(parentProjectFile);
        addLibraryReference(parentProperties, module.exports.getRelativeLibraryPath(parentDir, subDir));

        var subProperties = this._getPropertiesFile(subProjectFile);
        subProperties.set('target', parentProperties.get('target'));

        this._subProjectDirs[subDir] = true;
        this._dirty = true;
    },
    removeSubProject: function(parentDir, subDir) {
        var parentProjectFile = path.resolve(parentDir, 'project.properties');
        var parentProperties = this._getPropertiesFile(parentProjectFile);
        removeLibraryReference(parentProperties, module.exports.getRelativeLibraryPath(parentDir, subDir));
        delete this._subProjectDirs[subDir];
        this._dirty = true;
    },
    write: function () {
        if (!this._dirty) return;

        for (var filename in this._propertiesEditors) {
            fs.writeFileSync(filename, this._propertiesEditors[filename].toString());
        }

        for (var sub_dir in this._subProjectDirs)
        {
            shell.exec('android update lib-project --path "' + sub_dir + '"');
        }
        this._dirty = false;
    },
    _getPropertiesFile: function (filename) {
        if (!this._propertiesEditors[filename])
            this._propertiesEditors[filename] = properties_parser.createEditor(filename);

        return this._propertiesEditors[filename];
    }
};


module.exports = {
    AndroidProject: AndroidProject,
    getRelativeLibraryPath: function (parentDir, subDir) {
        var libraryPath = path.relative(parentDir, subDir);
        return (path.sep == '\\') ? libraryPath.replace(/\\/g, '/') : libraryPath;
    }
};
