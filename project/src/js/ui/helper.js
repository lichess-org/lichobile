var Zanimo = require('zanimo');
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

module.exports = helper;
