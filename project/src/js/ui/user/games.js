/** @jsx m */
import utils from '../../utils';
import helper from '../helper';
import widgets from '../widget/common';
import layout from '../layout';
import menu from '../menu';
import xhr from '../../xhr';
import gameLogic from '../../lichess/game';
import i18n from '../../i18n';
import getVariant from '../../lichess/variant';
import gameStatus from '../../lichess/status';
const moment = window.moment;

function renderGame(g, userId) {
  const time = gameLogic.time(g);
  const mode = g.rated ? i18n('rated') : i18n('casual');
  const title = time + ' • ' + getVariant(g.variant).name + ' • ' + mode;
  const date = moment(g.timestamp).calendar();
  const status = gameStatus.toLabel(g.status, g.winner, g.variant) +
    (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const userColor = g.players.white.userId === userId ? 'white' : 'black';

  return (
    <li className="list_item userGame">
      <span className="iconGame" data-icon={utils.gameIcon(g.perf)} />
      <div className="infos">
        <div className="title">{title}</div>
        <small className="date">{date}</small>
        <div className="players">
          <div className="player white">
            <span className="playerName">{g.players.white.userId}</span>
            <br/>
            <small className="playerRating">{g.players.white.rating}</small>
          </div>
          <div className="swords" data-icon="U" />
          <div className="player black">
            <span className="playerName">{g.players.black.userId}</span>
            <br/>
            <small className="playerRating">{g.players.black.rating}</small>
          </div>
        </div>
        <div className={helper.classSet({
          status: true,
          win: userColor === g.winner,
          loose: g.winner && userColor !== g.winner
        })}>{status}</div>
      </div>
    </li>
  );
}

module.exports = {
  controller: function() {
    const userId = m.route.param('id');
    var games = [];

    xhr.games(userId).then(data => {
      games = data.list;
    });

    return {
      getGames: function() { return games; },
      userId
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(widgets.header, null,
      widgets.backButton(m.route.param('id') + ' games')
    );

    function renderAllGames() {
      return (
        <div className="scroller page" config={helper.scroller}>
          <ul className="userGames">
            { ctrl.getGames().map(g => renderGame(g, ctrl.userId)) }
          </ul>
        </div>
      );
    }

    return layout.free(header, renderAllGames, widgets.empty, menu.view, widgets.empty);
  }
};
