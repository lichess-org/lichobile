import Zanimo from 'zanimo';
import settings from '../../settings';
import * as utils from '../../utils';
import ButtonHandler from './button';
import m from 'mithril';

var helper = {};

// this must be cached because of the access to document.body.style
var cachedTransformProp;

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform';
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
    }, err => console.log(err));
  };
};

helper.scale = function(element, isInitialized) {
  if (!isInitialized) {
    element.style[helper.transformProp()] = 'scale(0.97)';
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

helper.cachedViewportDim = null;
helper.viewportDim = function() {
  if (helper.cachedViewportDim) return helper.cachedViewportDim;

  let e = document.documentElement;
  let viewportDim = helper.cachedViewportDim = {
    vw: e.clientWidth,
    vh: e.clientHeight
  };
  return viewportDim;
};

helper.isWideScreen = function() {
  return helper.viewportDim().vw >= 600;
};

helper.isVeryWideScreen = function() {
  return helper.viewportDim().vw >= 960;
};

helper.isPortrait = function() {
  return window.matchMedia("(orientation: portrait)").matches;
};

helper.isLandscape = function() {
  return window.matchMedia("(orientation: landscape)").matches;
};

// allow user to opt out of track analytics
// only log if setting has it enabled
helper.analyticsTrackView = function(view) {
  var enabled = settings.general.analytics();
  if (enabled)
    window.analytics.trackView(view);
};

helper.autofocus = function(el, isUpdate) {
  if (!isUpdate) el.focus();
};

export default helper;
