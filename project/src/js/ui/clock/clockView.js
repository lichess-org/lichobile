import h from '../helper';
import layout from '../layout';
import i18n from '../../i18n';
import clockSettings from './clockSettings';
import { formatTimeinSecs } from '../../utils';
import sound from '../../sound';

export default function view(ctrl) {
  window.StatusBar.hide(); // Put this here instead of ctrl so it is reapplied after a phone lock and unlock
  const body = clockBody.bind(undefined, ctrl);
  const clockSettingsOverlay = renderClockSettingsOverlay.bind(undefined, ctrl);

  return layout.clock(body, clockSettingsOverlay);
}

function renderClockSettingsOverlay(ctrl) {
  return [
    clockSettings.view(ctrl.clockSettingsCtrl)
  ];
}

function clockBody(ctrl) {
  const clock = ctrl.clockObj();
  if (!clock) return null;
  const topActive = clock.activeSide() === 'top';
  const bottomActive = clock.activeSide() === 'bottom';
  const topFlagged = clock.flagged() === 'top';
  const bottomFlagged = clock.flagged() === 'bottom';

  return (
    <div className="clockContainer">
      <div key="topClockTapArea" className={'clockTapArea' + (topActive ? ' active' : '') + (topFlagged ? ' flagged' : '')} config={h.ontouch(() => onClockTap(ctrl, 'top'))}>
        <div className="clockTapAreaContent top">
          <span className={clock.topRemainingMoves ? '' : 'movesHidden'}>Moves to Time Control: {clock.topRemainingMoves ? clock.topRemainingMoves() : ''}</span>
        </div>
        <div className="clockTapAreaContent">
          <span className={'clockTime' + (topFlagged ? ' flagged' : '')}>
            { topFlagged ? 'b' : formatTimeinSecs(clock.topTime()) }
          </span>
        </div>
        <div className="clockTapAreaContent"/>
      </div>
      <div className="clockControls">
        <span className={'fa' + (clock.isRunning() ? ' fa-pause' : ' fa-play')} config={h.ontouch(() => ctrl.startStop())} />
        <span className="fa fa-refresh" config={h.ontouch(() => ctrl.reload())} />
        <span className="fa fa-cog" config={h.ontouch(() => ctrl.clockSettingsCtrl.open())} />
      </div>
      <div key="bottomClockTapArea" className={'clockTapArea' + (bottomActive ? ' active' : '')  + (bottomFlagged ? ' flagged' : '')} config={h.ontouch(() => onClockTap(ctrl, 'bottom'))}>
        <div className="clockTapAreaContent"/>
        <div className="clockTapAreaContent">
          <span className={'clockTime' + (bottomFlagged ? ' flagged' : '')}>
            { bottomFlagged ? 'b' : formatTimeinSecs(clock.bottomTime()) }
          </span>
        </div>
        <div className="clockTapAreaContent bottom">
          <span className={clock.bottomRemainingMoves ? '' : 'movesHidden'}>Moves to Time Control: {clock.bottomRemainingMoves ? clock.bottomRemainingMoves() : ''}</span>
        </div>
      </div>
    </div>
  );
}

function onClockTap(ctrl, side) {
  if (((ctrl.clockObj().activeSide() !== 'top') && (side === 'bottom')) || ((ctrl.clockObj().activeSide() !== 'bottom') && (side === 'top'))) {
    sound.clock();
    ctrl.clockTap(side);
  }
}
