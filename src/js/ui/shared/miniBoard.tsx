import * as helper from '../helper';
import ViewOnlyBoard from './ViewOnlyBoard';
import * as gameApi from '../../lichess/game';
import { MiniBoardGameObj } from '../../lichess/interfaces';
import * as h from 'mithril/hyperscript';

interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  link: () => void
  gameObj?: MiniBoardGameObj
  fen?: string
  lastMove?: string
  orientation?: Color
  bounds: Bounds
  customPieceTheme?: string
  variant?: VariantKey
}

const MiniBoard: Mithril.Component<Attrs, {}> = {
  view({ attrs }) {

    const { link, gameObj } = attrs;

    return (
      <div className="mini_board" oncreate={helper.ontapY(link)}>
        <div className="board_wrapper">
          {h(ViewOnlyBoard, attrs)}
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

export default MiniBoard
