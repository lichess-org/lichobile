var utils = require('../../utils');
var widgets = require('../widget/common');
var layout = require('../layout');
var formWidgets = require('../widget/form');
var i18n = require('../../i18n');
var settings = require('../../settings');
var helper = require('../helper');

function renderBody() {
  return [
    m('div.scroller.settings_list', { config: helper.scroller }, [
      m('ul#pieceThemes', {}, settings.general.theme.availablePieceThemes.map(function(t) {
        return m('li.list_item.piece_theme', {
          className: t
        }, formWidgets.renderRadio(t, 'piece_theme', t, settings.general.theme.piece));
      }))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('pieces'))
    );
    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
