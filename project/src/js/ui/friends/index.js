var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');

function renderBody() {
  /*return [
	m('ul.friends_list.general.scroller', {}, settings.general.theme.availablePieceThemes.map(function(f) {
	  return m('li.list_item', {}, f);
    }))
  ];*/
  return m('div.result', ['online', m('br'), m('br'), 'friends']);
}

module.exports = {
  controller: function() {
	helper.analyticsTrackView('Online Friends');
  },

  view: function() {
    var header = utils.partialf(widgets.header, null,
	  widgets.backButton(i18n('onlineFriends'))
	);
	return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};