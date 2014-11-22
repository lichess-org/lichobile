var utils = require('../utils');
var overlay = {};

var isOpen = false;

overlay.open = function() {
  isOpen = true;
};

overlay.close = function() {
  isOpen = false;
};

overlay.view = function(contentF) {
  var children = [
    m('div.overlay-close',
      { config: utils.ontouchstart(overlay.close) },
    '+')
  ];
  if (contentF) children = children.concat(contentF());
  return m('div.overlay.overlay-effect', {
    class: isOpen ? 'open' : '',
  }, children);
};

module.exports = overlay;
