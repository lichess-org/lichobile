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
    window.navigator.notification.alert(i18n('noInternetConnection'));
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

utils.partialf = function() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
};

utils.f = function() {
  var args = arguments,
    fn = arguments[0];
  return function() {
    fn.apply(fn, Array.prototype.slice.call(args, 1));
  };
};

// convenience function to bind a touchend mobile button handler in mithril
function bindTouchendButton(scrollableX, scrollableY, handler) {
  return function(el, isUpdate, context) {
    if (!isUpdate) {
      var options = {
        el: el,
        f: function(e) {
          e.stopPropagation();
          e.preventDefault();
          m.startComputation();
          handler(e, el);
          m.endComputation();
        },
        monotouchable: false
      };
      if (scrollableX || scrollableY) options.tolerance = 5;
      var constr;
      if (scrollableX)
        constr = mButton.ScrollableX.Touchend;
      else if (scrollableY)
        constr = mButton.ScrollableY.Touchend;
      else
        constr = mButton.Touchend;

      var button = new constr(options);

      context.onunload = function() {
        if (button) button.unbind();
      };
    }
  };
}

utils.ontouchend = utils.partialf(bindTouchendButton, false, false);
utils.ontouchendScrollX = utils.partialf(bindTouchendButton, true, false);
utils.ontouchendScrollY = utils.partialf(bindTouchendButton, false, true);

var viewPortDims = null;
utils.getViewportDims = function() {
  if (viewPortDims) return viewPortDims;
  var e = document.documentElement;
  viewPortDims = {
    vw: e.clientWidth,
    vh: e.clientHeight
  };
  return viewPortDims;
};

utils.viewOnlyBoard = function(fen, lastMove, orientation, variant, board, piece) {
  var config = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen: fen,
    lastMove: lastMove ? lastMove.match(/.{2}/g) : null,
    orientation: orientation || 'white'
  };
  return m('div.board', {
    className: [
      piece ? piece : 'merida',
      variant ? variant.key : '',
      board ? board : 'grey'
    ].join(' '),
    config: function(el, isUpdate, ctx) {
      if (ctx.ground) ctx.ground.set(config);
      else ctx.ground = chessground(el, config);
    }
  });
};

utils.progress = function(p) {
  if (p === 0) return null;
  return m('span', {
    className: 'progress ' + (p > 0 ? 'positive' : 'negative'),
    'data-icon': p > 0 ? 'N' : 'M'
  }, Math.abs(p));
};

utils.classSet = function(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
};

utils.noop = function() {};

utils.playerName = function(player, withRating) {
  if (player.username || player.user) {
    var name = player.username || player.user.username;
    if (player.user && player.user.title) name = player.user.title + ' ' + name;
    if (withRating && (player.user || player.rating)) name += ' (' + (player.rating || player.user.rating) + ')';
    return name;
  }
  if (player.ai)
    return i18n('aiNameLevelAiLevel', 'Stockfish', player.ai);
  return 'Anonymous';
};

utils.backHistory = function() {
  if (window.navigator.app && window.navigator.app.backHistory)
    window.navigator.app.backHistory();
  else
    window.history.go(-1);
};

utils.variantIconsMap = {
  bullet: 'T',
  blitz: ')',
  classical: '+',
  correspondence: ';',
  chess960: '\'',
  kingOfTheHill: '(',
  threeCheck: '.',
  antichess: '@',
  atomic: '>',
  puzzle: '-'
};

utils.gameIcon = function(g) {
  return g.opponent.ai ? ':' : utils.variantIconsMap[g.perf];
};

module.exports = utils;
