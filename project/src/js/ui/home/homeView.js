import m from 'mithril';
import { gameIcon, hasNetwork } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import helper from '../helper';
import newGameForm from '../newGameForm';
import settings from '../../settings';
import { header as headerWidget, userStatus } from '../shared/common';
import { renderTourJoin, renderGameEnd, renderFollow } from '../timeline';
import miniBoard from '../shared/miniBoard';

export default function homeView() {
  const ctrl = this;
  const isPortrait = helper.isPortrait();

  function body() {
    const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers() || '?');
    const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay() || '?');

    if (!hasNetwork()) {
      return (
        <div className="page homeOffline">
          <section id="homeCreate">
            <h2>{i18n('playOffline')}</h2>
            <button className="fatButton" oncreate={helper.ontouchY(() => m.route.set('/ai'))}>{i18n('playOfflineComputer')}</button>
            <button className="fatButton" oncreate={helper.ontouchY(() => m.route.set('/otb'))}>{i18n('playOnTheBoardOffline')}</button>
          </section>
        </div>
      );
    }

    return (
      <div className="native_scroller page">
        <div className="home">
          <section>
            <div>{m.trust(nbPlayers.replace(/(\d+)/, '<strong>$1</strong>'))}</div>
            <div>{m.trust(nbGames.replace(/(\d+)/, '<strong>$1</strong>'))}</div>
          </section>
          <section id="homeCreate">
            <button className="fatButton" oncreate={helper.ontouchY(newGameForm.openRealTime)}>{i18n('createAGame')}</button>
          </section>
          {renderDailyPuzzle(ctrl, isPortrait)}
          {renderTimeline(ctrl)}
          {renderWeekLeaders(ctrl)}
        </div>
      </div>
    );
  }

  const header = headerWidget.bind(undefined, 'lichess.org');

  return layout.free(header, body);
}

function miniBoardSize(isPortrait) {
  const { vh, vw } = helper.viewportDim();
  const side = isPortrait ? vw * 0.66 : vh * 0.66;
  const bounds = {
    height: side,
    width: side
  };
  return bounds;
}

function renderDailyPuzzle(ctrl, isPortrait) {
  const puzzle = ctrl.dailyPuzzle();

  if (!puzzle) return null;

  return (
    <section id="dailyPuzzle">
      <h2 className="homeTitle">{i18n('puzzleOfTheDay')}</h2>
        {m(miniBoard, {
          bounds: miniBoardSize(isPortrait),
          fen: puzzle.fen,
          orientation: puzzle.color,
          link: () => m.route.set('/training/' + puzzle.id)
        })}
    </section>
  );
}

function renderTimeline(ctrl) {
  const timeline = ctrl.timeline();
  if (timeline.length === 0) return null;

  return (
    <section id="timeline">
      <h2 className="homeTitle">{i18n('timeline')}</h2>
      <ul>
        { timeline.map(e => {
          if (e.type === 'follow') {
            return renderFollow(e);
          } else if (e.type === 'game-end') {
            return renderGameEnd(e);
          } else if (e.type === 'tour-join') {
            return renderTourJoin(e);
          }
          return null;
        })}
      </ul>
      <div className="homeMoreButton">
        <button oncreate={helper.ontouchY(() => m.route.set('/timeline'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  );
}

function renderWeekLeaders(ctrl) {
  const players = ctrl.weekTopPlayers();

  if (players.length === 0) return null;

  return (
    <section id="weekTopPlayers">
      <h2 className="homeTitle">{i18n('leaderboard')}</h2>
      <ul>
        { players.map(renderPlayer) }
      </ul>
      <div className="homeMoreButton">
        <button oncreate={helper.ontouchY(() => m.route.set('/players'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  );
}

function renderPlayer(p) {
  const perfKey = Object.keys(p.perfs)[0];
  const perf = p.perfs[perfKey];

  const supportedPerfs = settings.game.supportedVariants.concat([
    'blitz', 'bullet', 'classical'
  ]);

  if (supportedPerfs.indexOf(perfKey) === -1) return null;

  return (
    <li key={perfKey} className="list_item playerSuggestion nav" oncreate={helper.ontouchY(() => m.route.set('/@/' + p.id))}>
      {userStatus(p)}
      <div className="playerMiniPerf">
        <span className="rating" data-icon={gameIcon(perfKey)}>
          {perf.rating}
        </span>
        {helper.progress(perf.progress)}
      </div>
    </li>
  );
}
