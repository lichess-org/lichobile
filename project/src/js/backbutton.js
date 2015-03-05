var isFunction = require('lodash-node/modern/objects/isFunction');
var utils = require('./utils');

var stack = [];

module.exports = function() {
  var b = stack.pop();
  if (isFunction(b)) {
    b('backbutton');
    m.redraw();
  } else if (!/^\/$/.test(m.route())) {
    utils.backHistory();
  } else {
    window.navigator.app.exitApp();
  }
};

module.exports.stack = stack;
