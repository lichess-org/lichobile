import socket from '../../socket';
import { lobby as lobbyXhr, timeline as timelineXhr } from '../../xhr';
import { dailyPuzzle as dailyPuzzleXhr, topPlayersOfTheWeek as topPlayersOfTheWeekXhr } from './homeXhr';
import { hasNetwork, noop, handleXhrError } from '../../utils';
import { isForeground, setForeground } from '../../utils/appMode';
import { supportedTypes as supportedTimelineTypes } from '../timeline';
import * as m from 'mithril';

export interface HomeCtrl extends Mithril.Controller {
  featured: Mithril.Property<any>;
  nbConnectedPlayers: Mithril.Property<number>;
  nbGamesInPlay: Mithril.Property<number>;
  dailyPuzzle: Mithril.Property<any>;
  weekTopPlayers: Mithril.Property<Array<any>>;
  goToFeatured: () => void;
}

export default function homeCtrl(): HomeCtrl {

  const nbConnectedPlayers = m.prop<number>();
  const nbGamesInPlay = m.prop<number>();
  const dailyPuzzle = m.prop<any>();
  const weekTopPlayers = m.prop<Array<any>>([]);
  const timeline = m.prop<Array<any>>([]);

  function init() {
    if (isForeground()) {
      lobbyXhr(true).then(data => {
        socket.createLobby(data.lobby.version, noop, {
          n: (_, d) => {
            nbConnectedPlayers(d.d);
            nbGamesInPlay(d.r);
            m.redraw();
          }
        });
      });

      Promise.all([
        timelineXhr(),
        dailyPuzzleXhr(),
        topPlayersOfTheWeekXhr()
      ]).then(results => {
        const [timelineData, dailyData, topPlayersData] = results;
        timeline(
          timelineData.entries
          .filter(o => supportedTimelineTypes.indexOf(o.type) !== -1)
          .slice(0, 10)
        );
        dailyPuzzle(dailyData.puzzle);
        weekTopPlayers(topPlayersData);
      })
      .catch(handleXhrError);
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

  return {
    nbConnectedPlayers,
    nbGamesInPlay,
    dailyPuzzle,
    timeline,
    weekTopPlayers,
    onunload() {
      socket.destroy();
      document.removeEventListener('online', init);
      document.removeEventListener('resume', onResume);
    }
  };
}
