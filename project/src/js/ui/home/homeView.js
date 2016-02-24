import m from 'mithril';
import { noop, gameIcon } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import helper from '../helper';
import newGameForm from '../newGameForm';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import { header as headerWidget, userStatus } from '../shared/common';
import ViewOnlyBoard from '../shared/ViewOnlyBoard';

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

  return layout.free(headerWidget.bind(undefined, 'lichess.org'), body, noop);
}

function renderFeatured(ctrl) {
  const feat = ctrl.featured();

  if (!feat) return null;

  const { fen, lastMove } = feat.game;
  const orientation = feat.orientation;

  return (
    <section id="homeFeatured">
      <h2 className="contentTitle">Featured game</h2>
      <div className="mini_board" config={helper.ontouchY(ctrl.goToFeatured)}>
        <div className="board_wrapper">
          {m.component(ViewOnlyBoard, {fen, lastMove, orientation })}
        </div>
        <div className="vsbloc">
          <div className="antagonists">
            <div className="player">
              {feat.player.user.username}
            </div>
            <div className="opponent">
              {feat.opponent.user.username}
            </div>
          </div>
          <div className="ratingAndTime">
            <div>
              {feat.player.rating}
            </div>
            <div className="time" data-icon="p">
              {gameApi.time(feat)}
            </div>
            <div>
              {feat.opponent.rating}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderDailyPuzzle(ctrl) {
  const puzzle = ctrl.dailyPuzzle();

  if (!puzzle) return null;

  return (
    <section id="dailyPuzzle">
      <h2 className="contentTitle">{i18n('puzzleOfTheDay')}</h2>
      <div className="mini_board" config={helper.ontouchY(() => m.route('/training/' + puzzle.id))}>
        <div className="board_wrapper">
          {m.component(ViewOnlyBoard, {
            fen: puzzle.fen,
            orientation: puzzle.color
          })}
        </div>
      </div>
    </section>
  );
}

function renderWeekLeaders(ctrl) {
  const players = ctrl.weekTopPlayers();

  if (players.length === 0) return null;

  return (
    <section id="weekTopPlayers">
      <h2 className="contentTitle">Week's leaders</h2>
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
