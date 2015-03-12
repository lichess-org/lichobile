var utils = require('../../utils');
var widgets = require('../widget/common');
var formWidgets = require('../widget/form');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');
var settings = require('../../settings');
var iScroll = require('iscroll');


function renderBody() {
  return [
    m('div.scroller.settings_list', {
      config: function(el, isUpdate, context) {
        if (!isUpdate) {
          context.scroller = new iScroll(el, {
            preventDefaultException: {
              tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/
            }
          });
          context.onunload = function() {
            if (context.scroller) {
              context.scroller.destroy();
              context.scroller = null;
            }
          };
        }
      }
    }, [
      m('ul#boardThemes', settings.general.theme.availableBoardThemes.map(function(t) {
        return m('li.list_item', {}, [
          formWidgets.renderRadio(t[0], 'board_theme', t[1], settings.general.theme.board),
          m('div.board_icon.vertical_align', {
            className: t[1]
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
      widgets.backButton(i18n('boardThemes'))
    );
    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};
