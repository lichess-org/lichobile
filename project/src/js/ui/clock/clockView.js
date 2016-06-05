import h from '../helper';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';
import tabs from '../shared/tabs';
import clockSettings from './clockSettings';

export default function view(ctrl) {
  const body = clockBody.bind(undefined, ctrl);

  return layout.clock(body);
}

function clockBody(ctrl) {
  return (
    <div className="clockContainer">
      <div className="clockTapArea">
      </div>
      <div className="clockControls">
        <span className={'fa' + (ctrl.isRunning() ? ' fa-pause' : ' fa-play')} config={h.ontouch(() => ctrl.startStop())} />
        <span className="fa fa-cog" config={h.ontouch(() => ctrl.clockSettings.open())} />

      </div>
      <div className="clockTapArea">

      </div>
    </div>
  )
}
