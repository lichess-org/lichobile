import i18n from '../../i18n';
import settings from '../../settings';
import { gameIcon, variantReminder } from '../../utils';
import * as chessground from 'chessground-mobile';
import * as gameApi from '../../lichess/game';
import BoardBrush from './BoardBrush';

export interface Attrs {
  data: GameData
  chessgroundCtrl: Chessground.Controller
  bounds: BoardBounds
  isPortrait: boolean
  wrapperClasses?: string
  customPieceTheme?: string
  shapes?: Shape[]
  alert?: string
}

export interface Shape {
  brush: string
  orig: Pos
  dest?: Pos
  role?: Role
}

interface State {
  wrapperOnCreate(vnode: Mithril.ChildNode): void
  boardOnCreate(vnode: Mithril.ChildNode): void
  boardOnRemove(): void
  boardTheme: string
  pieceTheme: string
}

const Board: Mithril.Component<Attrs, State> = {
  oninit(vnode) {

    const { data, chessgroundCtrl, bounds } = vnode.attrs;

    function wrapperOnCreate({ dom }: Mithril.ChildNode) {
      const icon = gameIcon(data.game.variant.key);
      if (icon && data.game.variant.key !== 'standard' && data.game.status &&
        gameApi.isPlayerPlaying(data)) {
          variantReminder(dom as HTMLElement, icon);
        }
    }

    function boardOnCreate({ dom }: Mithril.ChildNode) {
      if (chessgroundCtrl) {
        if (!bounds) {
          chessgroundCtrl.setBounds(dom.getBoundingClientRect());
        } else {
          chessgroundCtrl.setBounds(bounds);
        }
        chessground.render(dom, chessgroundCtrl);
      }
    }

    function boardOnRemove() {
      if (chessgroundCtrl) chessgroundCtrl.unload();
    }

    vnode.state = {
      pieceTheme: settings.general.theme.piece(),
      boardTheme: settings.general.theme.board(),
      wrapperOnCreate,
      boardOnCreate,
      boardOnRemove
    };
  },

  view(vnode) {
    const { data, chessgroundCtrl, bounds, wrapperClasses, customPieceTheme, shapes, alert } = vnode.attrs;

    const boardClass = [
      'display_board',
      this.boardTheme,
      customPieceTheme || this.pieceTheme,
      data.game.variant.key
    ].join(' ');

    let wrapperClass = 'game_board_wrapper';

    if (wrapperClasses) {
      wrapperClass += ' ';
      wrapperClass += wrapperClasses;
    }

    const wrapperStyle = bounds ? {
      height: bounds.height + 'px',
      width: bounds.width + 'px'
    } : {};

    // fix nasty race condition bug when going from analysis to otb
    // TODO test that again
    if (!chessgroundCtrl) return null;

    return (
      <section className={wrapperClass} oncreate={this.wrapperOnCreate}
        style={wrapperStyle}
      >
        <div className={boardClass}
          oncreate={this.boardOnCreate}
          onremove={this.boardOnRemove}
        />
        { chessgroundCtrl.data.premovable.current || chessgroundCtrl.data.predroppable.current.key ?
          <div className="board_alert">
            {i18n('premoveEnabledClickAnywhereToCancel')}
          </div> : alert ?
          <div className="board_alert">
            {alert}
          </div> : null
        }
        {
          shapes && shapes.length ?
            BoardBrush(
              bounds,
              chessgroundCtrl.data.orientation,
              shapes
            ) : null
        }
      </section>
    );
  }
}

export default Board
