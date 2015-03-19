var Zanimo = require('zanimo');
var mButton = require('mobile-button');
var chessground = require('chessground');
var utils = require('../utils');
var settings = require('../settings');

var helper = {};

// this must be cached because of the access to document.body.style
var cachedTransformProp;

function computeTransformProp() {
  return 'transform' in document.body.style?
    'transform': 'webkitTransform' in document.body.style?
    'webkitTransform': 'mozTransform' in document.body.style?
    'mozTransform': 'oTransform' in document.body.style?
    'oTransform': 'msTransform';
}

helper.transformProp = function() {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
  return cachedTransformProp;
};

helper.scale = function(element, isInitialized) {
  if (!isInitialized) {
    element.style[helper.transformProp()] = 'scale(0.97)';
    element.style.visibility = 'hidden';
    Zanimo(element, 'visibility', 'visible', 100);
    Zanimo(element, 'transform', 'scale(1)', 200);
  }
};

helper.fadesIn = function(element, isInitialized) {
  if (!isInitialized) {
    element.style.opacity = 0;
    Zanimo(element, 'opacity', 1, 200);
  }
};

// helper targeted for popups since it acts on target parentElement
// TODO: refactor later if we need a more generic helper
helper.fadesOutPopup = function(callback) {
  return function(e) {
    m.redraw.strategy('none');
    Zanimo(e.target.parentElement, 'opacity', 0, 100).then(function() {
      m.startComputation();
      callback();
      m.endComputation();
    });
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

helper.ontouchend = utils.partialf(bindTouchendButton, false, false);
helper.ontouchendScrollX = utils.partialf(bindTouchendButton, true, false);
helper.ontouchendScrollY = utils.partialf(bindTouchendButton, false, true);


helper.viewOnlyBoard = function(fen, lastMove, orientation, variant, board, piece) {
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

helper.progress = function(p) {
  if (p === 0) return null;
  return m('span', {
    className: 'progress ' + (p > 0 ? 'positive' : 'negative'),
    'data-icon': p > 0 ? 'N' : 'M'
  }, Math.abs(p));
};

helper.classSet = function(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
};

var viewportDim = null;
helper.viewportDim = function() {
  if (viewportDim) return viewportDim;
  var e = document.documentElement;
  viewportDim = {
    vw: e.clientWidth,
    vh: e.clientHeight
  };
  return viewportDim;
};

// allow user to opt out of track analytics
// only log if setting has it enabled
helper.analyticsTrackView = function(view) {
  var enabled = settings.general.analytics();
  if (enabled)
    window.analytics.trackView(view);
}

module.exports = helper;
