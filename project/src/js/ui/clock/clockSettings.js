import m from 'mithril';
import settings from '../../settings';
import formWidgets from '../shared/form';
import popupWidget from '../shared/popup';
import helper from '../helper';
import backbutton from '../../backbutton';
import * as utils from '../../utils';

export default {

  controller: function(reload, clockObj) {
    let isOpen = false;

    function open() {
      if (clockObj().isRunning()) return;

      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    function addStage () {
      let stages = settings.clock.stage.stages();
      stages[stages.length-1].moves = stages[stages.length-2].moves;
      stages.push({time: stages[stages.length-1].time});
      settings.clock.stage.stages(stages);
      m.redraw();
    }

    function removeStage () {
      let stages = settings.clock.stage.stages();
      if (stages.length <= 2)
        return;
      stages.pop();
      settings.clock.stage.stages(stages);
      m.redraw();
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      },
      reload,
      addStage,
      removeStage
    };
  },

  view: function(ctrl) {
    const clockSettingsView = {
      simple: function () {
        return (
          <div key="simpleSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.simple.time, false, onChange)}
            </div>
          </div>
        );
      },
      increment: function () {
        return (
          <div key="incrementSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.increment.time, false, onChange)}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.increment.increment, false, onChange)}
            </div>
          </div>
        );
      },
      delay: function () {
        return (
          <div key="delaySettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.delay.time, false, onChange)}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.delay.increment, false, onChange)}
            </div>
          </div>
        );
      },
      bronstein: function () {
        return (
          <div key="bronsteinSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.bronstein.time, false, onChange)}
            </div>
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.bronstein.increment, false, onChange)}
            </div>
          </div>
        );
      },
      hourglass: function () {
        return (
          <div key="hourglassSettings" className="clockSettingParameters">
            <div className="select_input">
              {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.hourglass.time, false, onChange)}
            </div>
          </div>
        );
      },
      stage: function () {
        return (
          <div key="hourglassSettings" className="clockSettingParameters">
            { settings.clock.stage.stages().map(renderStage.bind(undefined, ctrl)) }
            <div className="select_input">
              {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.stage.increment, false, onChange)}
            </div>
          </div>
        );
      }
    };

    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game clock_settings',
        null,
        function() {
          return (
            <div>
              <div className="action">
                <div className="select_input">
                  {formWidgets.renderSelect('Clock', 'clock', settings.clock.availableClocks, settings.clock.clockType, false, onChange)}
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

function renderStage (ctrl, stage, index) {
  const time = updateTime.bind(undefined, index);
  const moves = updateMoves.bind(undefined, index);
  const hidePlus = settings.clock.stage.stages().length >= 5;
  const hideMinus = settings.clock.stage.stages().length <= 2;
  return (
    <div className="stageRow">
      <div className="stageRowTitle">{index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, time, false, onChange)}
      </div>
      <div className={'select_input inline stage stageRowMember' + ((index === settings.clock.stage.stages().length-1 ) ? ' lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', settings.clock.availableMoves.map(utils.tupleOf), moves, false, onChange)}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === settings.clock.stage.stages().length-1 ) ? ' lastStage' : '')}>
        <span  className={'fa fa-plus-square-o' + (hidePlus ? ' hiddenButton' : '')} config={helper.ontouch(() => ctrl.addStage())}/> <span className={'fa fa-minus-square-o' + (hideMinus ? ' hiddenButton' : '')} config={helper.ontouch(() => ctrl.removeStage())}/>
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

function onChange () {
  window.StatusBar.hide();
  m.redraw();
}
