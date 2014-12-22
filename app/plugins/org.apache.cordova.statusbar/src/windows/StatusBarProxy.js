/*
 *
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
 *
 */

 var isSupported = true; // we assume

function getViewStatusBar() {
    if(isSupported) {
        var ViewMan = Windows.UI.ViewManagement; // quick alias to save char
        if( ViewMan.StatusBar && 
            ViewMan.StatusBar.getForCurrentView ) {
            return ViewMan.StatusBar.getForCurrentView();
        }
        else {
            isSupported = false; // so we won't check again
        }
    }
    return null;
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

module.exports = {
    _ready: function(win, fail) {
        win(statusBar.occludedRect.height !== 0);
    },

    overlaysWebView: function () {
        // not supported
    },

    styleDefault: function () {
        // dark text ( to be used on a light background )
        getViewStatusBar().foregroundColor = { a: 0, r: 0, g: 0, b: 0 };
    },

    styleLightContent: function () {
        // light text ( to be used on a dark background )
        getViewStatusBar().foregroundColor = { a: 0, r: 255, g: 255, b: 255 };
    },

    styleBlackTranslucent: function () {
        // #88000000 ? Apple says to use lightContent instead
        return this.styleLightContent();
    },

    styleBlackOpaque: function () {
        // #FF000000 ? Apple says to use lightContent instead
        return this.styleLightContent();
    },

    backgroundColorByHexString: function (win, fail, args) {
        var rgb = hexToRgb(args[0]);
        var statusBar = getViewStatusBar();
        if(statusBar) {
            statusBar.backgroundColor = { a: 0, r: rgb.r, g: rgb.g, b: rgb.b };
            statusBar.backgroundOpacity = 1;
        }
    },

    show: function (win, fail) {
        getViewStatusBar().showAsync().done(win, fail);
    },

    hide: function (win, fail) {
        getViewStatusBar().hideAsync().done(win, fail);
    }
};

require("cordova/exec/proxy").add("StatusBar", module.exports);
