import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';
import * as xhr from './tournamentXhr';
import * as utils from '../../utils';
import i18n from '../../i18n';

export default {
  controller: function(tournament) {
    let isOpen = false;
    const playerData = m.prop();

    function open(p) {
      xhr.playerInfo(tournament().id, p.name)
      .then(data => {
        playerData(data);
        backbutton.stack.push(close);
        isOpen = true;
      })
      .catch(utils.handleXhrError);
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      },
      tournament,
      playerData
    };
  },

  view: function(ctrl) {
    if (!ctrl.isOpen()) return null;

    const tournament = ctrl.tournament();
    if (!tournament) return null;

    const playerData = ctrl.playerData();
    if (!playerData) return null;

    const player = playerData.player;
    const pairings = playerData.pairings;
    const avgOpRating = pairings.length ? (pairings.reduce((prev, x) => prev + x.op.rating, 0) / pairings.length).toFixed(0) : '0';


    function renderPlayerGame (game, index, gameArray) {
      let outcome = null;
      let outcomeClass = 'oppOutcome';
      if (game.score === undefined) {
        outcome = '*';
      }
      else if (Array.isArray(game.score)) {
        outcome = game.score[0];
        if (game.score[1] === 2)
          outcomeClass += ' streak';
        else if (game.score[1] === 3)
          outcomeClass += ' double';
      }
      else {
        outcome = game.score;
      }
      return (
        <tr className='list_item' key={game.id} config={helper.ontouch(() => m.route('/game/' + game.id + '/' + game.color))}>
          <td className="oppRank"> {gameArray.length - index} </td>
          <td className="oppName"> {game.op.name} </td>
          <td className="oppRating"> {game.op.rating} </td>
          <td className="oppColor"> <span className={'color-icon ' + game.color}> </span> </td>
          <td className={outcomeClass}> {outcome} </td>
        </tr>
      );
    }

    return (
      <div className="modal dark" id="tournamentPlayerInfoModal" config={helper.slidesInLeft}>
        <header>
          <button className="modal_close" data-icon="L"
            config={helper.ontouch(helper.slidesOutRight(ctrl.close, 'tournamentPlayerInfoModal'))}
          />
          <h2 className="playerModalHeader">
            {player.rank + '. ' + player.name + ' (' + player.rating + ') '} {helper.progress(player.ratingDiff)}
          </h2>
        </header>
        <div className="modal_content">
          <div className="tournamentPlayerInfo">
            <table className="playerStats">
              <tr>
                <td className="statName">
                  Score
                </td>
                <td className="statData">
                  <span className={player.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</span>
                </td>
              </tr>
              <tr>
                <td className="statName">
                  {i18n('gamesPlayed')}
                </td>
                <td className="statData">
                  {player.nb.game}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  Win Rate
                </td>
                <td className="statData">
                  {player.nb.game ? ((player.nb.win/player.nb.game)*100).toFixed(0) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  Berserk Rate
                </td>
                <td className="statData">
                  {player.nb.game ? ((player.nb.berserk/player.nb.game)*100).toFixed(0) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  Average Opponent
                </td>
                <td className="statData">
                  {avgOpRating}
                </td>
              </tr>
              <tr className={player.performance ? '' : 'invisible'}>
                <td className="statName">
                  Performance
                </td>
                <td className="statData">
                  {player.performance}
                </td>
              </tr>
            </table>
          </div>
          <div className="tournamentPlayerGames">
            <table className="playerGames">
              {pairings.map(renderPlayerGame)}
            </table>
          </div>
        </div>
      </div>
    );
  }
};
