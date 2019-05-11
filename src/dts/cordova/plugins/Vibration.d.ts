// Type definitions for Apache Cordova Vibration plugin.
// Project: https://github.com/apache/cordova-plugin-vibration
// Definitions by: Microsoft Open Technologies, Inc. <http://msopentech.com>, Louis Lagrange <https://github.com/Minishlink/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// Copyright (c) Microsoft Open Technologies, Inc.
// Licensed under the MIT license.

interface Notification {
    /**
     * Vibrates the device with a given pattern.
     * @param number[] pattern Pattern with which to vibrate the device.
     *                         The first value - number of milliseconds to wait before turning the vibrator on.
     *                         The next value - the number of milliseconds for which to keep the vibrator on before turning it off.
     * @param number  repeat   Optional index into the pattern array at which to start repeating (will repeat until canceled),
     *                         or -1 for no repetition (default).
     * @deprecated
     */
    vibrateWithPattern(pattern: number[], repeat: number): void;
    /**
     * Immediately cancels any currently running vibration.
     * @deprecated
     */
    cancelVibration(): void;
}
