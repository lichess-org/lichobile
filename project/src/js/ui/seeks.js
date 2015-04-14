var utils = require('../utils');
var helper = require('./helper');
var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./widget/common');
var xhr = require('../xhr');
var i18n = require('../i18n');
var socket = require('../socket');
var session = require('../session');
var loginModal = require('./loginModal');
var newGameForm = require('./newGameForm');
var uniq = require('lodash-node/modern/arrays/uniq');
var iScroll = require('iscroll');
var Zanimo = require('zanimo');

var seeks = {};

function seekUserId(seek) {
  return seek.username.toLowerCase();
}

function fixSeeks(ss) {
  var userId = session.getUserId();
  if (userId) ss.sort(function(a, b) {
    if (seekUserId(a) === userId) return -1;
    if (seekUserId(b) === userId) return 1;
  });
  return uniq(ss, function(s) {
    var username = seekUserId(s) === userId ? s.id : s.username;
    var key = username + s.mode + s.variant.key + s.days;
    return key;
  });
}

seeks.controller = function() {

  var lobbySocket;
  var pool = [];

  helper.analyticsTrackView('Seeks');

  xhr.lobby(true).then(function(data) {
    lobbySocket = socket.connectLobby(data.lobby.version, reload, {
      redirect: function(data) {
        m.route('/game' + data.url);
      },
      'reload_seeks': reload,
      resync: function() {
        xhr.lobby().then(function(data) {
          if (lobbySocket) lobbySocket.setVersion(data.lobby.version);
        });
      }
    });
  });

  var reload = function(feedback) {
    xhr.seeks(feedback).then(function(d) {
      pool = fixSeeks(d);
      m.redraw();
    });
  };
  reload(true);

  return {
    getPool: function() {
      return pool;
    },
    cancel: function(seekId) {
      return Zanimo(document.getElementById(seekId), 'opacity', '0', '500', 'ease-out').then(function() {
        lobbySocket.send('cancelSeek', seekId);
      });
    },
    join: function(seekId) {
      lobbySocket.send('joinSeek', seekId);
    },
    onunload: function() {
      if (lobbySocket) {
        lobbySocket.destroy();
        lobbySocket = null;
      }
    }
  };
};

function renderSeek(ctrl, seek) {
  var action = seek.username.toLowerCase() === session.getUserId() ? 'cancel' : 'join';
  return m('li', {
    key: seek.id,
    'id': seek.id,
    className: 'list_item seek ' + action,
    config: helper.ontouchendScrollY(utils.partialf(ctrl[action], seek.id))
  }, [
    m('div.icon', {
      'data-icon': seek.perf.icon
    }),
    m('div.body', [
      m('div.player', seek.username + ' (' + seek.rating + ')'),
      m('div.variant', seek.variant.name),
      m('div.time', [
        seek.days ? i18n(seek.days === 1 ? 'oneDay' : 'nbDays', seek.days) : '∞',
        ', ',
        i18n(seek.mode === 1 ? 'rated' : 'casual')
      ])
    ])
  ]);
}

seeks.view = function(ctrl) {

  var header = utils.partialf(widgets.header, i18n('correspondence'));
  var body = function() {

    if (!session.isConnected()) {
      return [
        m('div.seeks.disconnected', [
          m('div.seeks_background'),
          m('div.seeks_scroller', [
            m('div.vertical_align.must_signin', i18n('mustSignIn'))
          ]),
          m('button.fat', {
            key: 'seeks_login',
            config: helper.ontouchend(loginModal.open)
          }, i18n('logIn'))
        ])
      ];
    }

    return [
      m('div.seeks_scroller', {
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
      }, ctrl.getPool().length ?
        m('ul', ctrl.getPool().map(utils.partialf(renderSeek, ctrl))) :
        m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.')
      ),
      m('button#newGameCorres', {
        key: 'seeks_createagame',
        config: helper.ontouchend(newGameForm.openCorrespondence)
      }, [m('span.fa.fa-plus-circle'), i18n('createAGame')])
    ];
  };

  return layout.free(header, body, widgets.empty, menu.view, widgets.empty);
};

module.exports = seeks;
