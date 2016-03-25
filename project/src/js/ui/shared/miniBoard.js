import helper from '../helper';
import ViewOnlyBoard from './ViewOnlyBoard';
import gameApi from '../../lichess/game';
import m from 'mithril';

export default {
  view(ctrl, args) {

    const { bounds, fen, lastMove, orientation, link, gameObj } = args;

    return (
      <div className="mini_board" config={helper.ontouchY(link)}>
        <div className="board_wrapper">
          {m.component(ViewOnlyBoard, { bounds, fen, lastMove, orientation })}
        </div>
        { gameObj ?
        <div className="vsbloc">
          <div className="antagonists">
            <div className="player">
              {gameObj.player.user.username}
            </div>
            <div className="opponent">
              {gameObj.opponent.user.username}
            </div>
          </div>
          <div className="ratingAndTime">
            <div>
              {gameObj.player.rating}
            </div>
            <div className="time" data-icon="p">
              {gameApi.time(gameObj)}
            </div>
            <div>
              {gameObj.opponent.rating}
            </div>
          </div>
        </div> : null
        }
      </div>
    );
  }
};
