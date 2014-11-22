var utils = require('../utils');
var overlay = {};

overlay.controller = function() {
  this.isOpen = false;

  this.open = function() {
    this.isOpen = true;
  }.bind(this);

  this.close = function() {
    this.isOpen = false;
  }.bind(this);
};

overlay.view = function(ctrl, contentF) {
  var children = [
    m('button[type=button].overlay-close',
      { config: utils.ontouchstart(ctrl.close) },
    'Close')
  ];
  if (contentF) children = children.concat(contentF());
  return m('div.overlay.overlay-effect', {
    class: ctrl.isOpen ? 'open' : '',
  }, children);
};

module.exports = overlay;
