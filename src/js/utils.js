var utils = {};
var mButton = require('mobile-button');
var chessground = require('chessground');
var i18n = require('./i18n');

utils.hasNetwork = function() {
  var t = window.navigator.connection.type;
  return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
};

/*
 * Util function to handle xhr errors per request. We may not want to show
 * alerts on every request this is why it's not done in the extract function of
 * mithril request.
 *
 * @param {Error} error The error thrown in extract function (see http.js)
 */
utils.handleXhrError = function(error) {
  if (!utils.hasNetwork())
    window.navigator.notification.alert(i18n('noInternetConnection'), null, i18n('connectionError'));
  else
    window.navigator.notification.alert(i18n(error.message));
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

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

utils.partial = function() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
};

// convenience function to bind a button handler with mithril
function mbind(scrollable, handler) {
  return function(el, isUpdate, context) {
    if (!isUpdate) {
      var options = {
        el: el,
        f: function(e) {
          m.startComputation();
          handler(e, el);
          m.endComputation();
        },
        monotouchable: true,
        setActiveCls: false
      };
      if (scrollable) options.tolerance = 5;
      var constr = scrollable ? mButton.ScrollableX.Touchend : mButton.Touchend;
      var button = new constr(options);

      context.onunload = function() {
        if (button) button.unbind();
      };
    }
  };
}

utils.ontouchend = utils.partial(mbind, false);
utils.ontouchendScroll = utils.partial(mbind, true);

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
