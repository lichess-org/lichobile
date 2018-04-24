import * as helper from '../helper'
import ViewOnlyBoard from './ViewOnlyBoard'
import * as gameApi from '../../lichess/game'
import { noop } from '../../utils'
import { MiniBoardGameObj } from '../../lichess/interfaces'
import * as h from 'mithril/hyperscript'

interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  readonly fen: string
  readonly orientation: Color
  readonly link?: () => void
  readonly gameObj?: MiniBoardGameObj
  readonly lastMove?: string
  readonly bounds?: Bounds
  readonly customPieceTheme?: string
  readonly variant?: VariantKey
  readonly fixed?: boolean
  readonly delay?: Millis
}

interface State {
  link: () => void
}

const MiniBoard: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    this.link = attrs.link || noop
  },
  onupdate({ attrs }) {
    this.link = attrs.link || noop
  },
  view({ attrs }) {

    const { gameObj } = attrs

    return (
      <div className="mini_board" oncreate={helper.ontapY(() => this.link())}>
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
    )
  }
}

export default MiniBoard
