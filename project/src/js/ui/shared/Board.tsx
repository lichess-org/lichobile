import i18n from '../../i18n';
import settings from '../../settings';
import { gameIcon, variantReminder } from '../../utils';
import * as chessground from 'chessground-mobile';
import * as gameApi from '../../lichess/game';
import BoardBrush from './BoardBrush';

let boardTheme: string;
let pieceTheme: string;
export function onBoardThemeChange(t: string) {
  boardTheme = t;
}
export function onPieceThemeChange(t: string) {
  pieceTheme = t;
}

export interface Attrs {
  data: GameData
  chessgroundCtrl: Chessground.Controller
  bounds: BoardBounds
  isPortrait: boolean
  wrapperClasses?: string
  customPieceTheme?: string
  shapes?: any[]
  alert?: string
}

export default {
  oninit(vnode: Mithril.Vnode<Attrs>) {

    const { data, chessgroundCtrl, bounds } = vnode.attrs;

    function wrapperOnCreate({ dom }: Mithril.Vnode<void>) {
      const icon = gameIcon(data.game.variant.key);
      if (icon && data.game.variant.key !== 'standard' && data.game.status &&
        gameApi.isPlayerPlaying(data)) {
          variantReminder(dom, icon);
        }
    }

    function boardOnCreate({ dom }: Mithril.Vnode<void>) {
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
      wrapperOnCreate,
      boardOnCreate,
      boardOnRemove
    };
  },

  view(vnode: Mithril.Vnode<Attrs>) {
    const { data, chessgroundCtrl, bounds, isPortrait, wrapperClasses, customPieceTheme, shapes, alert } = vnode.attrs;

    boardTheme = boardTheme || settings.general.theme.board();
    pieceTheme = pieceTheme || settings.general.theme.piece();

    const boardClass = [
      'display_board',
      boardTheme,
      customPieceTheme || pieceTheme,
      data.game.variant.key
    ].join(' ');

    const key = 'board' + (isPortrait ? 'portrait' : 'landscape');
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
        style={wrapperStyle} key={key}
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
