var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');
var socket = require('../../socket');
var iScroll = require('iscroll');

var onlineFriends = [];

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
      m('ul#friends', onlineFriends.map(function(name) {
        var userId = utils.userFullNameToId(name);

        return m('li.list_item', {
          key: userId,
          'id': userId,
          config: helper.ontouchendScrollY(utils.f(m.route, '/@/' + userId))
        }, name);
      }))
    ])
  ];
}

module.exports = {
  controller: function() {

    var friendsSocket;

    helper.analyticsTrackView('Online Friends');

    function requestFriends() {
      friendsSocket.send('following_onlines');
    }

    function refreshList() {
      m.startComputation();
      onlineFriends.sort(utils.caseInsensitiveSort);
      m.endComputation();
    }

    friendsSocket = socket.connectSocket(requestFriends, {
      following_onlines: function(data) {
        onlineFriends = data;
        refreshList();
      },
      following_enters: function(name) {
        onlineFriends.push(name);
        refreshList();
      },
      following_leaves: function(name) {
        var nameIndex = onlineFriends.indexOf(name);
        if (nameIndex !== -1) {
          onlineFriends.splice(nameIndex, 1);
          refreshList();
        }
      }
    });

    return {
      onunload: function() {
        if (friendsSocket) {
          friendsSocket.destroy();
          friendsSocket = null;
        }
      }
    };

  },

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('onlineFriends'))
    );

    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};
