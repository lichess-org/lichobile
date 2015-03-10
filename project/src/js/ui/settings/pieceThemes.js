var utils = require('../../utils');
var widgets = require('../_commonWidgets');
var layout = require('../layout');
var menu = require('../menu');
var formWidgets = require('../_formWidgets');
var i18n = require('../../i18n');
var settings = require('../../settings');

function renderBody() {
  return [
    m('ul#pieceThemes.settings_list.scroller', settings.general.theme.availablePieceThemes.map(function(t) {
      return m('li.list_item', {}, [
        formWidgets.renderRadio(t, 'piece_theme', t, settings.general.theme.piece),
        m('div.piece_icon.vertical_align', { className: t })
      ]);
    }))
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
