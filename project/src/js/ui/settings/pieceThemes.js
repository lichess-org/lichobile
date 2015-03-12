var utils = require('../../utils');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var formWidgets = require('../widget/form');
var i18n = require('../../i18n');
var settings = require('../../settings');
var iScroll = require('iscroll');

function renderBody() {
  return [
    m('div.scroller.settings_list', {
      config: function(el, isUpdate, context) {
        if (!isUpdate) {
          context.scroller = new iScroll(el);
          context.onunload = function() {
            if (context.scroller) {
              context.scroller.destroy();
              context.scroller = null;
            }
          };
        }
      }
    }, [
      m('ul#pieceThemes', {}, settings.general.theme.availablePieceThemes.map(function(t) {
        return m('li.list_item', {}, [
          formWidgets.renderRadio(t, 'piece_theme', t, settings.general.theme.piece),
          m('div.piece_icon.vertical_align', {
            className: t
          })
        ]);
      }))
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
