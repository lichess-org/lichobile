import * as Mithril from 'mithril'
import * as helper from '../helper'
import ViewOnlyBoard from './ViewOnlyBoard'
import { noop } from '../../utils'
import { FeaturedGame } from '../../lichess/interfaces'
import h from 'mithril/hyperscript'

export interface Attrs {
  readonly fen: string
  readonly orientation: Color
  readonly link?: () => void
  readonly gameObj?: FeaturedGame
  readonly boardTitle?: Mithril.Children
  readonly lastMove?: string
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

    const { gameObj, boardTitle } = attrs

    return (
      <div className="mini_board_container">
        <div className="mini_board" oncreate={helper.ontapY(() => this.link())}>
          <div className="mini_board_helper">
            <div className="mini_board_wrapper">
              {h(ViewOnlyBoard, attrs)}
            </div>
          </div>
        </div>
        { gameObj ?
          renderVsBloc(gameObj) : boardTitle ?
            <div className="vsbloc">
              {boardTitle}
            </div> : null
        }
      </div>
    )
  }
}

function renderVsBloc(gameObj: FeaturedGame) {
  const player = gameObj.color === 'white' ? gameObj.white : gameObj.black
  const opponent = gameObj.color === 'white' ? gameObj.black : gameObj.white
  return (
    <div className="vsbloc">
      <div className="antagonists">
        <div className="player">
          {player.rank ? `#${player.rank} ` : ''}
          {player.title ? <span className="userTitle">{player.title}&nbsp;</span> : null}
          {player.name}
        </div>
        <div className="opponent">
          {opponent.rank ? `#${opponent.rank} ` : ''}
          {opponent.title ? <span className="userTitle">{opponent.title}&nbsp;</span> : null}
          {opponent.name}
        </div>
      </div>
      <div className="ratingAndTime">
        <div>
          {player.rating}
          {player.berserk ? <span className="berserk" data-icon="`" /> : null }
        </div>
        <div>
          {opponent.rating}
          {opponent.berserk ? <span className="berserk" data-icon="`" /> : null }
        </div>
      </div>
    </div>
  )
}

export default MiniBoard
