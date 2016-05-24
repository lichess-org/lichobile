import i18n from '../../i18n';
import settings from '../../settings';
import { gameIcon, variantReminder } from '../../utils';
import chessground from 'chessground-mobile';
import gameApi from '../../lichess/game';
import BoardBrush from './BoardBrush';
import m from 'mithril';

var boardTheme;
var pieceTheme;
export function onBoardThemeChange(t) {
  boardTheme = t;
}
export function onPieceThemeChange(t) {
  pieceTheme = t;
}

export default function(
  data,
  chessgroundCtrl,
  bounds,
  isPortrait,
  wrapperClasses,
  customPieceTheme,
  shapes,
  alert) {

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

  function wrapperConfig(el, isUpdate) {
    if (!isUpdate) {
      const icon = gameIcon(data.game.variant.key);
      if (icon && data.game.variant.key !== 'standard' && data.game.status &&
        gameApi.isPlayerPlaying(data)) {
          variantReminder(el, icon);
        }
    }
  }

  function boardConfig(el, isUpdate) {
    if (!isUpdate) {
      if (!bounds) {
        chessgroundCtrl.setBounds(el.getBoundingClientRect());
      } else {
        chessgroundCtrl.setBounds(bounds);
      }
      chessground.render(el, chessgroundCtrl);
    }
  }

  return (
    <section className={wrapperClass} config={wrapperConfig}
      style={wrapperStyle} key={key}
    >
    <div className={boardClass} config={boardConfig} />
    { chessgroundCtrl.data.premovable.current ?
      <div className="board_alert">
        {i18n('premoveEnabledClickAnywhereToCancel')}
      </div> : alert ?
      <div className="board_alert">
        {alert}
      </div> : null
    }
    {
      shapes && shapes.length ?
      m.component(BoardBrush, {
        bounds,
        orientation: chessgroundCtrl.data.orientation,
        shapes
      }) : null
    }
    </section>
  );
}
