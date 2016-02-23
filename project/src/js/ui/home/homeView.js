import m from 'mithril';
import { noop } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import helper from '../helper';
import newGameForm from '../newGameForm';
import gameApi from '../../lichess/game';
import { header as headerWidget } from '../shared/common';
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
        </div>
      </div>
    );
  }

  return layout.free(headerWidget.bind(undefined, 'lichess.org'), body, noop);
}

function renderFeatured(ctrl) {
  const feat = ctrl.featured();
  const { fen, lastMove } = ctrl.featured().game;
  const orientation = ctrl.featured().orientation;

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
