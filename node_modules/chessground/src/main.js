var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');
var fen = require('./fen');

// for usage outside of mithril
function init(element, config) {

  var controller = new ctrl(config);

  m.module(element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return api(element, controller, view);
}

module.exports = init;
module.exports.controller = ctrl;
module.exports.view = view;
module.exports.fen = fen;
