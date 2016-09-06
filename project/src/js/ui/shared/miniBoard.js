import helper from '../helper';
import ViewOnlyBoard from './ViewOnlyBoard';
import * as gameApi from '../../lichess/game';
import * as m from 'mithril';

export default {
  view(vnode) {

    const { bounds, fen, lastMove, orientation, link, gameObj } = vnode.attrs;

    return (
      <div className="mini_board" oncreate={helper.ontapY(link)}>
        <div className="board_wrapper">
          {m(ViewOnlyBoard, { bounds, fen, lastMove, orientation })}
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
