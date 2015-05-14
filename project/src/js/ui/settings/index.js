var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var formWidgets = require('../widget/form');
var settings = require('../../settings');
var i18n = require('../../i18n');

function renderBody() {
  return [
    m('ul.settings_list.general.scroller', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.general.animations)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.general.pieceDestinations)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('allowAnalytics'), 'sound', settings.general.analytics)),
      m('li.list_item.nav', {
        config: helper.ontouchendScrollY(utils.f(m.route, '/settings/themes/board'))
      }, i18n('board')),
      m('li.list_item.nav', {
        config: helper.ontouchendScrollY(utils.f(m.route, '/settings/themes/piece'))
      }, i18n('pieces'))
    ]),
    window.lichess.version ? m('section.app_version', 'v' + window.lichess.version) : null
  ];
}

module.exports = {
  controller: function() {
    helper.analyticsTrackView('Settings');
  },

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('settings'))
    );
    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
