/** @jsx m */
var utils = require('../../utils');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var xhr = require('../../xhr');
var gameLogic = require('../../lichess/game');
var i18n = require('../../i18n');
var getVariant = require('../../lichess/variant');
var gameStatus = require('../../lichess/status');
var moment = window.moment;

function renderGame(g) {
  var time = gameLogic.time(g);
  var mode = g.rated ? i18n('rated') : i18n('casual');
  var title = time + ' • ' + getVariant(g.variant).name + ' • ' + mode;
  var date = moment(g.timestamp).calendar();
  var status = gameStatus.toLabel(g.status, g.winner, g.variant) +
    (g.winner ? '. ' + i18n(g.winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
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
        <div className="status">{status}</div>
      </div>
    </li>
  );
}

module.exports = {
  controller: function() {
    var username = m.route.param('id');
    var games = [];

    xhr.games(username).then(data => {
      games = data.list;
    });

    return {
      getGames: function() { return games; },
      username: username
    };
  },

  view: function(ctrl) {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(m.route.param('id') + ' games')
    );
    console.log(ctrl.getGames());

    function renderAllGames() {
      return <ul className="userGames">{ ctrl.getGames().map(renderGame) }</ul>;
    }

    return layout.free(header, renderAllGames, widgets.empty, menu.view, widgets.empty);
  }
};
