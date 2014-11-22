'use strict';

var utils = {};
var chessground = require('chessground');

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

// convenience function to bind an handler on touchstart with mithril
utils.ontouchstart = function(handler) {
  return function(el, isUpdate, context) {
    if (!isUpdate) el.addEventListener('touchstart', function(e) {
      m.startComputation();
      handler(e);
      m.endComputation();
    });

    context.onunload = function() {
      el.removeEventListener('touchstart', handler);
    };
  };
};

var viewPortDims = null;
utils.getViewportDims = function() {
  if (viewPortDims) return viewPortDims;
  var e = document.documentElement;
  viewPortDims = { vw: e.clientWidth, vh: e.clientHeight };
  return viewPortDims;
};

utils.viewOnlyBoard = function(fen) {
  var ctrl = new chessground.controller({viewOnly: true, coordinates: false});
  return m('div.board.grey.merida', [
    chessground.view(ctrl)
  ]);
};

module.exports = utils;
