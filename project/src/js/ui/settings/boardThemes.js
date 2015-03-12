var utils = require('../../utils');
var widgets = require('../widget/common');
var formWidgets = require('../widget/form');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');
var settings = require('../../settings');


function renderBody() {
  return [
    m('ul#boardThemes.settings_list.scroller', settings.general.theme.availableBoardThemes.map(function(t) {
      return m('li.list_item', {}, [
        formWidgets.renderRadio(t[0], 'board_theme', t[1], settings.general.theme.board),
        m('div.board_icon.vertical_align', { className: t[1] })
      ]);
    }))
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialƒ(widgets.header, null,
      widgets.backButton(i18n('boardThemes'))
    );
    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};
