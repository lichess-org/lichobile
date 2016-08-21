import socket from '../../socket';
import redraw from '../../utils/redraw';
import { lobby as lobbyXhr, timeline as timelineXhr } from '../../xhr';
import { dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { hasNetwork, noop } from '../../utils';
import { isForeground, setForeground } from '../../utils/appMode';
import { supportedTypes as supportedTimelineTypes } from '../timeline';
import m from 'mithril';

export default function homeCtrl(vnode) {

  const nbConnectedPlayers = m.prop();
  const nbGamesInPlay = m.prop();
  const dailyPuzzle = m.prop();
  const timeline = m.prop([]);
  const weekTopPlayers = m.prop([]);

  function init() {
    if (isForeground()) {
      lobbyXhr(true).then(data => {
        socket.createLobby(data.lobby.version, noop, {
          n: (_, d) => {
            nbConnectedPlayers(d.d);
            nbGamesInPlay(d.r);
            redraw();
          }
        });
      });

      Promise.all([
        dailyPuzzleXhr(),
        topPlayersOfTheWeekXhr()
      ])
      .then(results => {
        const [dailyData, topPlayersData] = results;
        dailyPuzzle(dailyData.puzzle);
        weekTopPlayers(topPlayersData);
      });

      timelineXhr()
      .then(data => {
        timeline(
          data.entries
          .filter(o => supportedTimelineTypes.indexOf(o.type) !== -1)
          .slice(0, 10)
        );
      });
    }
  }

  function onResume() {
    setForeground();
    init();
  }

  if (hasNetwork()) {
    init();
  }

  document.addEventListener('online', init);
  document.addEventListener('resume', onResume);

  vnode.state = {
    nbConnectedPlayers,
    nbGamesInPlay,
    dailyPuzzle,
    timeline,
    weekTopPlayers,
    init,
    onResume
  };
}
