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

exports.defineAutoTests = function () {
    describe('Network (navigator.connection)', function () {
        it("network.spec.1 should exist", function () {
            expect(navigator.network && navigator.network.connection).toBeDefined();
            expect(navigator.connection).toBeDefined();
        });

        it("network.spec.2 should be set to a valid value", function () {
            var validValues = {
                'unknown': 1,
                'ethernet': 1,
                'wifi': 1,
                '2g': 1,
                'cellular': 1,
                '3g': 1,
                '4g': 1,
                'none': 1
            };
            expect(validValues[navigator.connection.type]).toBe(1);
        });

        it("network.spec.3 should have the same value in deprecated and non-deprecated apis", function () {
            expect(navigator.network.connection.type).toBe(navigator.connection.type);
        });

        it("network.spec.4 should define constants for connection status", function () {
            expect(Connection.UNKNOWN).toBe("unknown");
            expect(Connection.ETHERNET).toBe("ethernet");
            expect(Connection.WIFI).toBe("wifi");
            expect(Connection.CELL_2G).toBe("2g");
            expect(Connection.CELL_3G).toBe("3g");
            expect(Connection.CELL_4G).toBe("4g");
            expect(Connection.NONE).toBe("none");
            expect(Connection.CELL).toBe("cellular");
        });
    });
};

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

exports.defineManualTests = function (contentEl, createActionButton) {
    function eventOutput(s) {
        var el = document.getElementById("results");
        el.innerHTML = el.innerHTML + s + "<br>";
    }

    function printNetwork() {
        eventOutput("navigator.connection.type=" + navigator.connection.type);
        eventOutput("navigator.network.connection.type=" + navigator.network.connection.type);
    }

    function onEvent(e) {
        eventOutput('Event of type: ' + e.type);
        printNetwork();
    }

    /******************************************************************************/

    var html = '<div id="info">' +
        '<b>Results:</b><br>' +
        '<span id="results"></span>' +
        '</div><div id="connection"></div>' +
        'Expected result: Status box will update with type of connection using two different methods. Both values must match.' +
        '  The result will be unknown, ethernet, wifi, 2g, 3g, 4g, none, or cellular. Make sure it matches what the device is connected to.' +
        '</p> <div id="actions"></div>';

    document.addEventListener("online", onEvent, false);
    document.addEventListener("offline", onEvent, false);
    contentEl.innerHTML = html;

    createActionButton('Show Network Connection', function () {
        printNetwork();
    }, 'connection');

    createActionButton('Clear Log', function () {
        document.getElementById('results').innerHTML = '';
    }, 'actions');
};
