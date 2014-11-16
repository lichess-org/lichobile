'use strict';

var utils = {};

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

utils.xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};


function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

utils.partial = function() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
};

module.exports = utils;
