// All cordova js API moved to cordova-lib . This is a temporary shim for
// dowstream packages that use cordova-cli for the API.

var cordova_lib = require('cordova-lib');
module.exports = cordova_lib.cordova;