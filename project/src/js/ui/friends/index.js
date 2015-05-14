var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var i18n = require('../../i18n');
var socket = require('../../socket');
var iScroll = require('iscroll');
var friends = require('../../lichess/friends');

function renderBody() {
  return [
    m('div.scroller.friends_list', {
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
        context.scroller.refresh();
      }
    }, [
      m('ul#friends', friends.list().map(function(name) {
        var userId = utils.userFullNameToId(name);

        return m('li.list_item.nav', {
          key: userId,
          'id': userId,
          config: helper.ontouchY(utils.f(m.route, '/@/' + userId))
        }, name);
      }))
    ])
  ];
}

module.exports = {
  controller: function() {
    helper.analyticsTrackView('Online Friends');
    const defaultSocket = socket.socket();

    return {
      onunload: () => {
        if (defaultSocket) defaultSocket.destroy();
      }
    };
  },

  view: function() {
    var header = utils.partialf(widgets.header, i18n('onlineFriends'));

    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
