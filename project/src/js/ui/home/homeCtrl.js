import socket from '../../socket';
import settings from '../../settings';
import { lobby as lobbyXhr } from '../../xhr';
import throttle from 'lodash/throttle';
import { featured as featuredXhr, dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { hasNetwork, noop, handleXhrError } from '../../utils';
import m from 'mithril';

export default function homeCtrl() {

  var featuredFeed;

  const featured = m.prop();

  const nbConnectedPlayers = m.prop();
  const nbGamesInPlay = m.prop();
  const dailyPuzzle = m.prop();
  const weekTopPlayers = m.prop([]);

  function onFeatured() {
    return throttle(featuredXhr, 1000)()
    .then(data => {
      featured(data);
      m.redraw();
    });
  }

  function init() {

    lobbyXhr(true).then(data => {
      socket.createLobby(data.lobby.version, noop, {
        n: (_, d) => {
          nbConnectedPlayers(d.d);
          nbGamesInPlay(d.r);
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
      featuredFeed = new EventSource(`http://${window.lichess.apiEndPoint}/tv/feed`);

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

  }

  function onPause() {
    if (featuredFeed) featuredFeed.close();
  }

  if (hasNetwork()) {
    init();
  }

  document.addEventListener('online', init);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('resume', init, false);

  return {
    featured,
    nbConnectedPlayers,
    nbGamesInPlay,
    dailyPuzzle,
    weekTopPlayers,
    goToFeatured() {
      settings.tv.channel('best');
      m.route('/tv');
    },
    onunload() {
      if (featuredFeed) featuredFeed.close();
      socket.destroy();
      document.removeEventListener('online', init);
      document.removeEventListener('resume', init);
      document.removeEventListener('pause', onPause);
    }
  };
}
