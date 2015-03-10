var utils = require('../../utils');
var widgets = require('../_commonWidgets');
var layout = require('../layout');
var menu = require('../menu');
var formWidgets = require('../_formWidgets');
var i18n = require('../../i18n');

function renderBody() {
  return [
    m('ul#pieceThemesSelector', [
      m('li', 'hello pieces'),
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialƒ(widgets.header, null,
      widgets.backButton(i18n('pieceThemes'))
    );
    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};
