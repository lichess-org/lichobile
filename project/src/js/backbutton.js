var isFunction = require('lodash-node/modern/objects/isFunction');

var stack = [];

module.exports = function() {
  var b = stack.pop();
  if (isFunction(b)) {
    b(true);
    m.redraw();
  } else if (!/^\/$/.test(m.route())) {
    window.navigator.app.backHistory();
  } else {
    window.navigator.app.exitApp();
  }
};

module.exports.stack = stack;
