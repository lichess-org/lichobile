import h from '../helper';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';
import clockSettings from './clockSettings';
import { formatTimeinSecs } from '../../utils';

export default function view(ctrl) {
  window.StatusBar.hide(); // Put this here instead of ctrl so it is reapplied after a phone lock and unlock
  const body = clockBody.bind(undefined, ctrl);

  return layout.clock(body);
}

function clockBody(ctrl) {
  const clock = ctrl.clockObj();
  const topActive = clock.activeSide === 'top';
  const bottomActive = clock.activeSide === 'bottom';
  console.log(clock.topTime);
  console.log(clock.bottomTime);

  return (
    <div className="clockContainer">
      <div className={'clockTapArea' + (topActive ? ' active' : '')} config={h.ontouch(() => (!bottomActive ? onClockTap(ctrl, 'top') : null))}>
        <span className="clockTime">
          { formatTimeinSecs(clock.topTime) }
        </span>
      </div>
      <div className="clockControls">
        <span className={'fa' + (ctrl.isRunning() ? ' fa-pause' : ' fa-play')} config={h.ontouch(() => ctrl.startStop())} />
        <span className="fa fa-refresh" config={h.ontouch(() => ctrl.reload())} />
        <span className="fa fa-cog" config={h.ontouch(() => ctrl.clockSettings.open())} />
      </div>
      <div className={'clockTapArea' + (bottomActive ? ' active' : '')} config={h.ontouch(() => (!topActive ? onClockTap(ctrl, 'bottom') : null))}>
        <span className="clockTime">
          { formatTimeinSecs(clock.bottomTime) }
        </span>
      </div>
    </div>
  );
}

function onClockTap(ctrl, side) {
  navigator.vibrate(100);
  ctrl.clockTap(side);
}
