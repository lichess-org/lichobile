var overlay = {};

overlay.controller = function() {
  this.isOpen = false;

  this.open = function() {
    this.isOpen = true;
    m.redraw();
  }.bind(this);

  this.close = function() {
    this.isOpen = false;
    m.redraw();
  }.bind(this);
};

overlay.view = function(ctrl, contentF) {
  var children = [
    m('button[type=button].overlay-close', {
      config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.close);
      }
    }, 'Close')
  ];
  if (contentF) children.concat(contentF);
  return m('div.overlay.overlay-effect', {
    class: ctrl.isOpen ? 'open' : '',
  }, children);
};

module.exports = overlay;
