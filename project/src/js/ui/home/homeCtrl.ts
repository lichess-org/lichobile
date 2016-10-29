import * as m from 'mithril';
import socket from '../../socket';
import redraw from '../../utils/redraw';
import { lobby as lobbyXhr, timeline as timelineXhr } from '../../xhr';
import { dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { hasNetwork, noop } from '../../utils';
import { isForeground, setForeground } from '../../utils/appMode';
import { supportedTypes as supportedTimelineTypes } from '../timeline';
import { TimelineEntry } from '../../lichess/interfaces'

export interface HomeCtrl {
  nbConnectedPlayers: Mithril.Property<number>;
  nbGamesInPlay: Mithril.Property<number>;
  dailyPuzzle: Mithril.Property<any>;
  weekTopPlayers: Mithril.Property<Array<any>>;
  timeline: Mithril.Property<Array<any>>;
}

export default function homeCtrl(vnode: Mithril.Vnode<{}>): void {

  const nbConnectedPlayers = m.prop<number>();
  const nbGamesInPlay = m.prop<number>();
  const dailyPuzzle = m.prop<any>();
  const weekTopPlayers = m.prop<Array<any>>([]);
  const timeline = m.prop<Array<any>>([]);

  function init() {
    if (isForeground()) {
      lobbyXhr(true).then(data => {
        socket.createLobby(data.lobby.version, noop, {
          n: (_: any, d: PongMessage) => {
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
      })
      .catch(console.error.bind(console));

      timelineXhr()
      .then(data => {
        timeline(
          data.entries
          .filter((o: TimelineEntry) => supportedTimelineTypes.indexOf(o.type) !== -1)
          .slice(0, 10)
        );
      })
      .catch(console.error.bind(console));
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
