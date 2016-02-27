import m from 'mithril';
import { gameIcon } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import helper from '../helper';
import newGameForm from '../newGameForm';
import settings from '../../settings';
import { header as headerWidget, userStatus, empty } from '../shared/common';
import miniBoard from '../shared/miniBoard';

export default function homeView(ctrl) {

  function body() {
    const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers() || '?');
    const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay() || '?');

    return (
      <div className="native_scroller page">
        <div className="home">
          <section>
            <div>{m.trust(nbPlayers.replace(/(\d+)/, '<strong>$1</strong>'))}</div>
            <div>{m.trust(nbGames.replace(/(\d+)/, '<strong>$1</strong>'))}</div>
          </section>
          <section id="homeCreate">
            <button className="fatButton" config={helper.ontouchY(newGameForm.openRealTime)}>{i18n('createAGame')}</button>
          </section>
          {renderFeatured(ctrl)}
          {renderDailyPuzzle(ctrl)}
          {renderWeekLeaders(ctrl)}
        </div>
      </div>
    );
  }

  return layout.free(headerWidget.bind(undefined, 'lichess.org'), body, empty);
}

function renderFeatured(ctrl) {
  const feat = ctrl.featured();

  if (!feat) return null;

  return (
    <section id="homeFeatured">
      <h2 className="homeTitle">Featured game</h2>
      {m.component(miniBoard, {
        fen: feat.game.fen,
        lastMove: feat.game.lastMove,
        orientation: feat.orientation,
        link: ctrl.goToFeatured,
        gameObj: feat}
      )}
    </section>
  );
}

function renderDailyPuzzle(ctrl) {
  const puzzle = ctrl.dailyPuzzle();

  if (!puzzle) return null;

  return (
    <section id="dailyPuzzle">
      <h2 className="homeTitle">{i18n('puzzleOfTheDay')}</h2>
        {m.component(miniBoard, {
          fen: puzzle.fen,
          orientation: puzzle.color,
          link: () => m.route('/training/' + puzzle.id)
        })}
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
    <li key={perfKey} className="list_item playerSuggestion nav" config={helper.ontouchY(() => m.route('/@/' + p.id))}>
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
