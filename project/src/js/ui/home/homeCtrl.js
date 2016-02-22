import socket from '../../socket';
import { hasNetwork } from '../../utils';
import settings from '../../settings';
import { lobby as lobbyXhr } from '../../xhr';
import { featured as featuredXhr } from './homeXhr';
import { noop } from '../../utils';
import m from 'mithril';

export default function homeCtrl() {
  if (!hasNetwork()) {
    m.route('/ai');
  }

  const featured = m.prop({});
  const nbConnectedPlayers = m.prop();
  const nbGamesInPlay = m.prop();

  function onFeatured() {
    return featuredXhr()
    .then(data => {
      featured(data);
      m.redraw();
    });
  }

  lobbyXhr(true).then(data => {
    socket.createLobby(data.lobby.version, noop, {
      n: n => {
        nbConnectedPlayers(n);
        m.redraw();
      },
      nbr: n => {
        nbGamesInPlay(n);
        m.redraw();
      },
      featured: onFeatured
    });
  })
  .then(featuredXhr)
  .then(data => {
    featured(data);
    const featuredFeed = new EventSource(`http://${window.lichess.apiEndPoint}/tv/feed`);
    featuredFeed.onmessage = function(ev) {
      const obj = JSON.parse(ev.data);
      featured().game.fen = obj.d.fen;
      featured().game.lastMove = obj.d.lm;
      m.redraw();
    };
  });

  return {
    featured,
    nbConnectedPlayers,
    nbGamesInPlay,
    goToFeatured() {
      settings.tv.channel('best');
      m.route('/tv');
    }
  };
}
