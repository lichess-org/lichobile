var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');
var xhr = require('../../xhr');
var session = require('../../session');
var socket = require('../../socket');

var onlineFriends = [];

function renderBody() {
  return [
    m('ul.friends_list.general.scroller', {}, onlineFriends.map(function(f) {
      return m('li.list_item', {}, f);
    }))
  ];
}

module.exports = {
  controller: function() {
	  
    var friendsSocket;

    helper.analyticsTrackView('Online Friends');

    var toastName = function(name) {
      window.plugins.toast.show(name, 'short', 'center');
    }

    var requestFriends = function() {
      friendsSocket.send('following_onlines');
    }

    xhr.friends().then(function(data) {
      friendsSocket = socket.connectFriends('v1', requestFriends, {
        following_onlines: function(data) {
          // TODO - bind this to a scroller so the list updates
          onlineFriends = data;
        },
        following_enters: function(name) {
          onlineFriends.push(name);
        },
        following_leaves: function(name) {
          var nameIndex = onlineFriends.indexOf(name);
          if (nameIndex !== -1) {
            onlineFriends.splice(nameIndex, 1);
          }
        }
      });
    });

    this.onunload = function() {
      if (friendsSocket) {
        friendsSocket.destroy();
        friendsSocket = null;
      }
    }.bind(this);

  },

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('onlineFriends'))
    );

    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};