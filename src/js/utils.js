'use strict';

var utils = {};
var mButton = require('mobile-button');
var chessground = require('chessground');

utils.hasNetwork = function() {
  if (window.cordova) {
    var t = window.navigator.connection.type;
    return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
  }

  return true;
};

utils.handleXhrError = function(error) {
  // assume lichess unreachable when error is null
  console.log(error);
  if (error === null) {
    if (window.cordova && !utils.hasNetwork())
      window.navigator.notification.alert('No internet connection', null, 'Connection error');
    else
      window.navigator.notification.alert('lichess.org is unreachable', null, 'Connection error');
  }
  else if (typeof error.error === 'string')
    if (window.cordova) window.navigator.notification.alert(error.error);
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

// convenience function to bind a button handler with mithril
utils.mbind = function(scrollable, handler) {
  return function(el, isUpdate, context) {
    if (!isUpdate) {
      var options = {
        el: el,
        f: function(e) {
          m.startComputation();
          handler(e);
          m.endComputation();
        },
        monotouchable: true,
        setActiveCls: false
      };
      if (scrollable) options.tolerance = 5;
      var constr = scrollable ? mButton.ScrollableX.Touchend : mButton.Touchend;
      var button = new constr(options);
    }

    context.onunload = function() {
      if (button) button.unbind();
    };
  };
};

utils.ontouchend = utils.partial(utils.mbind, false);
utils.ontouchendScroll = utils.partial(utils.mbind, true);


var viewPortDims = null;
utils.getViewportDims = function() {
  if (viewPortDims) return viewPortDims;
  var e = document.documentElement;
  viewPortDims = { vw: e.clientWidth, vh: e.clientHeight };
  return viewPortDims;
};

utils.viewOnlyBoard = function(fen, lastMove, orientation) {
  var ctrl = new chessground.controller({
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen: fen,
    lastMove: lastMove,
    orientation: orientation
  });
  return m('div.board.grey.merida', [
    chessground.view(ctrl)
  ]);
};

utils.classSet = function(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
};

module.exports = utils;
