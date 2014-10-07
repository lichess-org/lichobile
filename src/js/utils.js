'use strict';

var utils = {};

var i18n = {};

utils.hasNetwork = function() {
  if (window.cordova) {
    var t = window.navigator.connection.type;
    return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
  }

  return true;
};

utils.isHidden = function(el) {
  return (el.offsetParent === null);
};

// softkeyboard
var hiddenA = document.createElement('a');
hiddenA.href = "#";
document.body.appendChild(hiddenA);

utils.hideKeyboard = function() {
  hiddenA.focus();
};

utils.lichessSri = Math.random().toString(36).substring(2);

utils.userFullNameToId = function(fullName) {
  var split = fullName.split(' ');
  var id = split.length === 1 ? split[0] : split[1];
  return id.toLowerCase();
};

utils.serializeQueryParameters = function(obj) {
  var str = "";
  for (var key in obj) {
    if (str !== "") {
      str += "&";
    }
    str += key + "=" + obj[key];
  }
  return str;
};

utils.trans = function(str) {
  var t = i18n[str] || str;
  Array.prototype.slice.call(arguments, 1).forEach(function(arg) {
    t = t.replace('%s', arg);
  });
  return t;
};

module.exports = utils;
