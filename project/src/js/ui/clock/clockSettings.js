import m from 'mithril';
import i18n from '../../i18n';
import settings from '../../settings';
import formWidgets from '../shared/form';
import popupWidget from '../shared/popup';
import helper from '../helper';
import backbutton from '../../backbutton';
import * as utils from '../../utils';

export default {

  controller: function(reload) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      },
      reload
    };
  },

  view: function(ctrl) {
    const clockSettingsView = {
      simple: function () {
        return (
          <div key="simpleSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.gameSetup.availableTimes, settings.clock.simple.time, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      increment: function () {
        return (
          <div key="incrementSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.gameSetup.availableTimes, settings.clock.increment.time, false, () => m.redraw())}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.gameSetup.availableIncrements.map(utils.tupleOf), settings.clock.increment.increment, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      delay: function () {
        return (
          <div key="delaySettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.gameSetup.availableTimes, settings.clock.delay.time, false, () => m.redraw())}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.gameSetup.availableIncrements.map(utils.tupleOf), settings.clock.delay.increment, false, () => m.redraw())}
            </div>
          </div>
        );
      }
    };

    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        null,
        function() {
          return (
            <div>
              <div className="action">
                <div className="select_input">
                  {formWidgets.renderSelect('Clock', 'clock', settings.clock.availableClocks, settings.clock.clockType, false, () => m.redraw())}
                </div>
                {clockSettingsView[settings.clock.clockType()]()}
              </div>
              <button className="newClockButton" data-icon="E" config={helper.ontouch(function () {
                  ctrl.reload();
                  ctrl.close();
                })}>
                Set Clock
              </button>
            </div>
          );
        },
        ctrl.isOpen(),
        ctrl.close
      );
    }

    return null;
  }
};
