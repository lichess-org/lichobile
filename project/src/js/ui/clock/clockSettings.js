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
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.simple.time, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      increment: function () {
        return (
          <div key="incrementSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.increment.time, false, () => m.redraw())}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.increment.increment, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      delay: function () {
        return (
          <div key="delaySettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.delay.time, false, () => m.redraw())}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.delay.increment, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      bronstein: function () {
        return (
          <div key="bronsteinSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.bronstein.time, false, () => m.redraw())}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.bronstein.increment, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      hourglass: function () {
        return (
          <div key="hourglassSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.hourglass.time, false, () => m.redraw())}
            </div>
          </div>
        );
      },
      stage: function () {
        console.log('stage');
        return (
          <div key="hourglassSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.stage.increment, false, () => m.redraw())}
            </div>
            { settings.clock.stage.stages().map(renderStage) }
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

function renderStage (stage, index) {
  console.log('renderStage');
  const time = updateTime.bind(undefined, index);
  const moves = updateMoves.bind(undefined, index);
  return (
    <div className="stageRow">
      <div className="stageRowTitle"> Stage {index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, time, false, () => m.redraw())}
      </div>
      <div className={'select_input inline stage stageRowMember ' + ((index === settings.clock.stage.stages().length-1 ) ? 'lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', settings.clock.availableMoves.map(utils.tupleOf), moves, false, () => m.redraw())}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === settings.clock.stage.stages().length-1 ) ? 'lastStage' : '')}>
        <span className="fa fa-plus-square-o" /> <span className="fa fa-minus-square-o" />
      </div>
    </div>
  );
}

function updateTime (index, time) {
  let stages = settings.clock.stage.stages();

  if (time) {
    stages[index].time = time;
    settings.clock.stage.stages(stages);
  }
  return stages[index].time;
}

function updateMoves (index, moves) {
  let stages = settings.clock.stage.stages();
  if (moves) {
    stages[index].moves = moves;
    settings.clock.stage.stages(stages);
  }

  return stages[index].moves;
}
