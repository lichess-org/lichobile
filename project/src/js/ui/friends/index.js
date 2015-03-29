var utils = require('../../utils');
var helper = require('../helper');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var i18n = require('../../i18n');
var xhr = require('../../xhr');
var socket = require('../../socket');
var iScroll = require('iscroll');

var onlineFriends = [];

// scroll testing
// var onlineFriends = [
//   "friend1",
//   "friend2",
//   "friend3",
//   "friend4",
//   "friend5",
//   "friend6",
//   "friend7",
//   "friend8",
//   "friend9",
//   "friend10",
//   "friend11",
//   "friend12",
//   "friend13",
//   "friend14",
//   "friend15",
//   "friend16",
// ];

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
        return m('li.list_item', {
          key: name,
          'id': name
          // TODO connect user route
          // Disabling user route for now
          // Will be branched for separate feature
          //,config: helper.ontouchendScrollY(utils.f(m.route, '/user/'+name))
        }, name);
      }))
    ])
  ];
}

module.exports = {
  controller: function() {
	  
    var friendsSocket;

    this.scroller = null;

    helper.analyticsTrackView('Online Friends');

    var requestFriends = function() {
      friendsSocket.send('following_onlines');
    }

    var refreshList = function() {
      // TODO sort the onlineFriends array

      // update view
      m.redraw();
    }

    xhr.friends().then(function(data) {
      friendsSocket = socket.connectFriends('v1', requestFriends, {
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