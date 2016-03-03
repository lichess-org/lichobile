import socket from '../../socket';
import { hasNetwork } from '../../utils';
import settings from '../../settings';
import { lobby as lobbyXhr } from '../../xhr';
import { featured as featuredXhr, dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { noop, handleXhrError } from '../../utils';
import m from 'mithril';

export default function homeCtrl() {

  const featured = m.prop();

  const nbConnectedPlayers = m.prop();
  const nbGamesInPlay = m.prop();
  const dailyPuzzle = m.prop();
  const weekTopPlayers = m.prop([]);

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
  });

  Promise.all([
    featuredXhr(true),
    dailyPuzzleXhr(),
    topPlayersOfTheWeekXhr()
  ]).then(results => {
    const [featuredData, dailyData, topPlayersData] = results;

    // featured game
    featured(featuredData);
    const featuredFeed = new EventSource(`http://${window.lichess.apiEndPoint}/tv/feed`);
    featuredFeed.onmessage = function(ev) {
      const obj = JSON.parse(ev.data);
      featured().game.fen = obj.d.fen;
      featured().game.lastMove = obj.d.lm;
      m.redraw();
    };

    // daily puzzle
    dailyPuzzle(dailyData.puzzle);

    // week top players
    weekTopPlayers(topPlayersData);
  })
  .catch(handleXhrError);

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
