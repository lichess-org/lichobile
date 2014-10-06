var ctrl = require('./ctrl');
var view = require('./view/main');
var m = require('mithril');

module.exports = function(element, config, router, i18n) {

  var controller = new ctrl(config, router, i18n);

  m.module(element, {
    controller: function () { return controller; },
    view: view
  });

};
