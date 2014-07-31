'use strict';

module.exports.$ = function $(selector, context) { return (context || window.document).querySelector(selector); };
module.exports.$$ = function $$(selector, context) { return (context || window.document).querySelectorAll(selector); };

module.exports.isConnected = function () {
  var t = window.navigator.connection.type;
  return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
};

// softkeyboard
var hiddenA = document.createElement('a');
hiddenA.href = "#";
document.body.appendChild(hiddenA);

module.exports.hideKeyboard = function () { hiddenA.focus(); };

module.exports.lichessSri = Math.random().toString(36).substring(2);
