var utils = {};
var mButton = require('mobile-button');
var chessground = require('chessground');
var i18n = require('./i18n');

utils.hasNetwork = function() {
  var t = window.navigator.connection.type;
  return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
};

/*
 * Util function to handle xhr errors per request. We don't want to show alerts
 * for every request, this is why it's not done in the extract function of
 * m.request.
 *
 * @param {Error} error The error thrown in extract function (see http.js)
 */
utils.handleXhrError = function(error) {
  if (!utils.hasNetwork())
    window.navigator.notification.alert(i18n('noInternetConnection'), null, i18n('connectionError'));
  else
    window.plugins.toast.show(i18n(error.message), 'short', 'center');
};

utils.lichessSri = Math.random().toString(36).substring(2);

utils.serializeQueryParameters = function(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += key + '=' + obj[key];
  }
  return str;
};

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

utils.partialƒ = function() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
};

utils.ƒ = function() {
  var args = arguments, fn = arguments[0];
  return function() {
    fn.apply(fn, Array.prototype.slice.call(args, 1));
  };
};

// convenience function to bind a touchend mobile button handler in mithril
function bindTouchendButton(scrollable, handler) {
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

utils.ontouchend = utils.partialƒ(bindTouchendButton, false);
utils.ontouchendScroll = utils.partialƒ(bindTouchendButton, true);

var viewPortDims = null;
utils.getViewportDims = function() {
  if (viewPortDims) return viewPortDims;
  var e = document.documentElement;
  viewPortDims = { vw: e.clientWidth, vh: e.clientHeight };
  return viewPortDims;
};

utils.viewOnlyBoard = function(fen, lastMove, orientation) {
  var config = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen: fen,
    lastMove: lastMove,
    orientation: orientation || 'white'
  };
  return m('div.board.grey.merida', {
    config: function(el, isUpdate, ctx) {
      if (ctx.ground) ctx.ground.set(config);
      else ctx.ground = chessground(el, config);
    }
  });
};

utils.classSet = function(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
};

utils.noop = function() {
};

utils.backHistory = function() {
  window.history.go(-1);
  if (window.navigator.app && window.navigator.app.backHistory)
    window.navigator.app.backHistory();
};

module.exports = utils;
