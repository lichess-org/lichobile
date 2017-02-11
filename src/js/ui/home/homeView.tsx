import * as h from 'mithril/hyperscript';
import router from '../../router';
import { gameIcon, hasNetwork } from '../../utils';
import i18n from '../../i18n';
import * as helper from '../helper';
import newGameForm from '../newGameForm';
import settings from '../../settings';
import { userStatus } from '../shared/common';
import { renderTourJoin, renderGameEnd, renderFollow } from '../timeline';
import miniBoard from '../shared/miniBoard';
import { HomeState } from './interfaces'

export function body(ctrl: HomeState) {
  const isPortrait = helper.isPortrait();
  const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers() || '?');
  const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay() || '?');

  if (!hasNetwork()) {
    return (
      <div className="page homeOffline">
        <section id="homeCreate">
          <h2>{i18n('playOffline')}</h2>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/ai'))}>{i18n('playOfflineComputer')}</button>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/otb'))}>{i18n('playOnTheBoardOffline')}</button>
        </section>
      </div>
    );
  }

  return (
    <div className="native_scroller page">
      <div className="home">
        <section>
          <div>{nbPlayers}</div>
          <div>{nbGames}</div>
        </section>
        <section id="homeCreate">
          <button className="fatButton" oncreate={helper.ontapY(newGameForm.openRealTime)}>{i18n('createAGame')}</button>
        </section>
        {renderDailyPuzzle(ctrl, isPortrait)}
        {renderWeekLeaders(ctrl)}
        {renderTimeline(ctrl)}
      </div>
    </div>
  );
}

function miniBoardSize(isPortrait: boolean) {
  const { vh, vw } = helper.viewportDim();
  const side = isPortrait ? vw * 0.66 : vh * 0.66;
  const bounds = {
    height: side,
    width: side
  };
  return bounds;
}

function renderDailyPuzzle(ctrl: HomeState, isPortrait: boolean) {
  const puzzle = ctrl.dailyPuzzle();

  if (!puzzle) return null;

  return (
    <section id="dailyPuzzle">
      <h2 className="homeTitle">{i18n('puzzleOfTheDay')}</h2>
        {h(miniBoard, {
          bounds: miniBoardSize(isPortrait),
          fen: puzzle.fen,
          orientation: puzzle.color,
          link: () => router.set('/training/' + puzzle.id)
        })}
    </section>
  );
}

function renderTimeline(ctrl: HomeState) {
  const timeline = ctrl.timeline();
  if (timeline.length === 0) return null;

  return (
    <section id="timeline">
      <h2 className="homeTitle">{i18n('timeline')}</h2>
      <ul>
        { timeline.map((e: any) => {
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
        <button oncreate={helper.ontapY(() => router.set('/timeline'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  );
}

function renderWeekLeaders(ctrl: HomeState) {
  const players = ctrl.weekTopPlayers();

  if (players.length === 0) return null;

  return (
    <section id="weekTopPlayers">
      <h2 className="homeTitle">{i18n('leaderboard')}</h2>
      <ul>
        { players.map(renderPlayer) }
      </ul>
      <div className="homeMoreButton">
        <button oncreate={helper.ontapY(() => router.set('/ranking'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  );
}

function renderPlayer(p: any) {
  const perfKey = Object.keys(p.perfs)[0];
  const perf = p.perfs[perfKey];

  const supportedPerfs = settings.game.supportedVariants.concat([
    'blitz', 'bullet', 'classical'
  ]);

  if (supportedPerfs.indexOf(perfKey) === -1) return null;

  return (
    <li key={perfKey} className="list_item playerSuggestion" oncreate={helper.ontapY(() => router.set('/@/' + p.id))}>
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
