import helper from '../helper';
import uniq from 'lodash/array/uniq';
import session from '../../session';
import * as xhr from '../../xhr';
import socket from '../../socket';
import Zanimo from 'zanimo';
import m from 'mithril';

export default function controller() {

  var pool = [];

  helper.analyticsTrackView('Correspondence seeks');

  xhr.lobby(true).then(function(data) {
    socket.createLobby(data.lobby.version, reload, {
      redirect: socket.redirectToGame,
      reload_seeks: reload,
      resync: () => xhr.lobby().then(d => {
        socket.setVersion(d.lobby.version);
      })
    });
  });

  function reload(feedback) {
    xhr.seeks(feedback).then(function(d) {
      pool = fixSeeks(d);
      m.redraw();
    });
  }
  reload(true);

  return {
    getPool: function() {
      return pool;
    },
    cancel: function(seekId) {
      return Zanimo(document.getElementById(seekId), 'opacity', '0', '500', 'ease-out')
        .then(() => socket.send('cancelSeek', seekId))
        .catch(console.log.bind(console));
    },
    join: function(seekId) {
      socket.send('joinSeek', seekId);
    },
    onunload: socket.destroy
  };
}

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
