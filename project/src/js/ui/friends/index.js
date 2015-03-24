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
          console.log('---------------------following onlines received');
          console.log(JSON.stringify(data));
          onlineFriends = data;
          renderBody();
          console.log('---------------------following onlines received');
          /*data.forEach(function(f) {
            console.log(f);
          });*/
        },
        following_enters: function(name) {
          console.log('follower came online ' + name);
          toastName(name);
        },
        following_leaves: function(name) {
          console.log('follower left: ' + name);
          toastName(name);
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