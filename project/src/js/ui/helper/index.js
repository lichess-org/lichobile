var Zanimo = require('zanimo');
var chessground = require('chessground');
var settings = require('../../settings');
var utils = require('../../utils');
var IScroll = require('iscroll');
var ButtonHandler = require('./button');

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

function collectionHas(coll, el) {
  for(var i = 0, len = coll.length; i < len; i++) {
    if(coll[i] === el) return true;
  }
  return false;
}

function findParentBySelector(el, selector) {
  var matches = document.querySelectorAll(selector);
  var cur = el.parentNode;
  while(cur && !collectionHas(matches, cur)) {
    cur = cur.parentNode;
  }
  return cur;
}

helper.fadesIn = function(element, isInitialized) {
  if (!isInitialized) {
    element.style.opacity = 0;
    Zanimo(element, 'opacity', 1, 150);
  }
};

helper.fadesOut = function(callback, selector) {
  return function(e) {
    var el = selector ? findParentBySelector(e.target, selector) : e.target;
    m.redraw.strategy('none');
    Zanimo(el, 'opacity', 0, 250).then(function() {
      m.startComputation();
      callback();
      m.endComputation();
    });
  };
};

helper.scale = function(element, isInitialized) {
  if (!isInitialized) {
    element.style[helper.transformProp()] = 'scale(0.97)';
    element.style.visibility = 'hidden';
    Zanimo(element, 'visibility', 'visible', 100);
    Zanimo(element, 'transform', 'scale(1)', 200);
  }
};

helper.ontouch = function(tapHandler, holdHandler, scrollX, scrollY) {
  return function(el, isUpdate, context) {
    if (!isUpdate) {
      var unbind = ButtonHandler(el,
        e => {
          m.startComputation();
          tapHandler(e);
          m.endComputation();
        },
        holdHandler ? () => utils.autoredraw(holdHandler) : null,
        scrollX,
        scrollY
      );
      context.onunload = function() {
        unbind();
        unbind = null;
      };
    }
  };
};

helper.ontouchX = function(tapHandler, holdHandler) {
  return helper.ontouch(tapHandler, holdHandler, true, false);
};
helper.ontouchY = function(tapHandler, holdHandler) {
  return helper.ontouch(tapHandler, holdHandler, false, true);
};

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
      piece ? piece : settings.general.theme.piece(),
      variant ? variant.key : '',
      board ? board : settings.general.theme.board()
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

helper.isWideScreen = function() {
  return helper.viewportDim().vw >= 600;
};

// allow user to opt out of track analytics
// only log if setting has it enabled
helper.analyticsTrackView = function(view) {
  var enabled = settings.general.analytics();
  if (enabled)
    window.analytics.trackView(view);
};

helper.scroller = function(el, isUpdate, context) {
  if (!isUpdate) {
    context.scroller = new IScroll(el, {
      preventDefaultException: {
        tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/
      }
    });
    context.onunload = function() {
      if (context.scroller) {
        context.scroller.destroy();
        context.scroller = null;
      }
    };
  }
};

helper.cond = function(pred, vdom) {
  return pred ? vdom : null;
};

helper.autofocus = function(el, isUpdate) {
  if (!isUpdate) el.focus();
};

module.exports = helper;
