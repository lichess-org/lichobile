import socket from '../../socket';
import { hasNetwork } from '../../utils';
import settings from '../../settings';
import { lobby as lobbyXhr } from '../../xhr';
import { featured as featuredXhr, dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { noop, handleXhrError } from '../../utils';
import m from 'mithril';

export default function homeCtrl() {

  const featured = m.prop({});

  const nbConnectedPlayers = m.prop();
  const nbGamesInPlay = m.prop();
  const dailyPuzzle = m.prop();
  const weekTopPlayers = m.prop([]);

  if (!hasNetwork()) {
    m.route('/ai');
    return {
      featured,
      nbConnectedPlayers,
      nbGamesInPlay,
      dailyPuzzle,
      weekTopPlayers
    };
  }

  function onFeatured() {
    return featuredXhr()
    .then(data => {
      featured(data);
      m.redraw();
    }, handleXhrError);
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
  }, handleXhrError);

  featuredXhr(true)
  .then(data => {
    featured(data);
    const featuredFeed = new EventSource(`http://${window.lichess.apiEndPoint}/tv/feed`);
    featuredFeed.onmessage = function(ev) {
      const obj = JSON.parse(ev.data);
      featured().game.fen = obj.d.fen;
      featured().game.lastMove = obj.d.lm;
      m.redraw();
    };
  }, handleXhrError);

  dailyPuzzleXhr().then(d => dailyPuzzle(d.puzzle), handleXhrError);

  topPlayersOfTheWeekXhr().then(weekTopPlayers, handleXhrError);

  return {
    featured,
    nbConnectedPlayers,
    nbGamesInPlay,
    dailyPuzzle,
    weekTopPlayers,
    goToFeatured() {
      settings.tv.channel('best');
      m.route('/tv');
    }
  };
}
