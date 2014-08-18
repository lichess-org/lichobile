'use strict';

module.exports.$ = function $(selector, context) { return (context || window.document).querySelector(selector); };
module.exports.$$ = function $$(selector, context) { return (context || window.document).querySelectorAll(selector); };

module.exports.hasNetwork = function () {
  var t = window.navigator.connection.type;
  return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
};

module.exports.isHidden = function (el) {
  return (el.offsetParent === null);
};

// softkeyboard
var hiddenA = document.createElement('a');
hiddenA.href = "#";
document.body.appendChild(hiddenA);

module.exports.hideKeyboard = function () { hiddenA.focus(); };

module.exports.lichessSri = Math.random().toString(36).substring(2);

module.exports.userFullNameToId = function (fullName) {
  var split = fullName.split(' ');
  var id = split.length === 1 ? split[0] : split[1];
  return id.toLowerCase();
};
