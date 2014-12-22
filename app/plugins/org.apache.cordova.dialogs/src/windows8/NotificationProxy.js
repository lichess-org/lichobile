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

/*global Windows:true */

var cordova = require('cordova');

var isAlertShowing = false;
var alertStack = [];

module.exports = {
    alert:function(win, loseX, args) {

        if (isAlertShowing) {
            var later = function () {
                module.exports.alert(win, loseX, args);
            };
            alertStack.push(later);
            return;
        }
        isAlertShowing = true;

        var message = args[0];
        var _title = args[1];
        var _buttonLabel = args[2];

        var md = new Windows.UI.Popups.MessageDialog(message, _title);
        md.commands.append(new Windows.UI.Popups.UICommand(_buttonLabel));
        md.showAsync().then(function() {
            isAlertShowing = false;
            win && win();

            if (alertStack.length) {
                setTimeout(alertStack.shift(), 0);
            }

        });
    },

    confirm:function(win, loseX, args) {

        if (isAlertShowing) {
            var later = function () {
                module.exports.confirm(win, loseX, args);
            };
            alertStack.push(later);
            return;
        }

        isAlertShowing = true;

        try {
            var message = args[0];
            var _title = args[1];
            var buttons = args[2];

            var md = new Windows.UI.Popups.MessageDialog(message, _title);

            buttons.forEach(function(buttonLabel) {
                md.commands.append(new Windows.UI.Popups.UICommand(buttonLabel));
            });

            md.showAsync().then(function(res) {
                isAlertShowing = false;
                var result = res ? buttons.indexOf(res.label) + 1 : 0;
                win && win(result);
                if (alertStack.length) {
                    setTimeout(alertStack.shift(), 0);
                }

            });
        } catch (e) {
            // set isAlertShowing flag back to false in case of exception
            isAlertShowing = false;
            if (alertStack.length) {
                setTimeout(alertStack.shift(), 0);
            }
            // rethrow exception
            throw e;
        }
    },

    beep:function(winX, loseX, args) {

        // set a default args if it is not set
        args = args && args.length ? args : ["1"];

        var snd = new Audio('ms-winsoundevent:Notification.Default');
        var count = parseInt(args[0]) || 1;
        snd.msAudioCategory = "Alerts";

        var onEvent = function () {
            if (count > 0) {
                snd.play();
            } else {
                snd.removeEventListener("ended", onEvent);
                snd = null;
                winX && winX(); // notification.js just sends null, but this is future friendly
            }
            count--;
        };
        snd.addEventListener("ended", onEvent);
        onEvent();

    }
};

require("cordova/exec/proxy").add("Notification",module.exports);
