import * as helper from '../helper';
import redraw from '../../utils/redraw';
import challengesApi from '../../lichess/challenges';
import { uniqBy } from 'lodash/array';
import session from '../../session';
import settings from '../../settings';
import * as xhr from '../../xhr';
import socket from '../../socket';
import * as Zanimo from 'zanimo';
import * as m from 'mithril';
import * as stream from 'mithril/stream';

export default function oninit(vnode) {

  var pool = [];
  const selectedTab = stream(vnode.attrs.tab || 'public');
  const sendingChallenges = stream(getSendingCorres());

  helper.analyticsTrackView('Correspondence');

  xhr.lobby(true).then(function(data) {
    socket.createLobby(data.lobby.version, reload, {
      redirect: socket.redirectToGame,
      reload_seeks: reload,
      resync: () => xhr.lobby().then(d => {
        socket.setVersion(d.lobby.version);
      })
    });
  });

  challengesApi.refresh().then(() => {
    sendingChallenges(getSendingCorres());
  });

  function getSendingCorres() {
    return challengesApi.sending().filter(challengesApi.isPersistent);
  }

  function cancelChallenge(id) {
    return xhr.cancelChallenge(id)
    .then(() => {
      challengesApi.remove(id);
      sendingChallenges(getSendingCorres());
    });
  }

  function reload(feedback) {
    xhr.seeks(feedback)
    .then(function(d) {
      pool = fixSeeks(d).filter(s => settings.game.supportedVariants.indexOf(s.variant.key) !== -1);
      redraw();
    });
  }
  reload(true);

  vnode.state = {
    selectedTab,
    sendingChallenges,
    cancelChallenge,
    getPool: function() {
      return pool;
    },
    cancel: function(seekId) {
      return Zanimo(document.getElementById(seekId), 'opacity', '0', '300', 'ease-out')
        .then(() => socket.send('cancelSeek', seekId))
        .catch(console.log.bind(console));
    },
    join: function(seekId) {
      socket.send('joinSeek', seekId);
    }
  };
}

function seekUserId(seek) {
  return seek.username.toLowerCase();
}

function fixSeeks(ss) {
  var userId = session.getUserId();
  if (userId) ss.sort((a, b) => {
    if (seekUserId(a) === userId) return -1;
    if (seekUserId(b) === userId) return 1;
    return 0;
  });
  return uniqBy(ss, s => {
    var username = seekUserId(s) === userId ? s.id : s.username;
    var key = username + s.mode + s.variant.key + s.days;
    return key;
  });
}
