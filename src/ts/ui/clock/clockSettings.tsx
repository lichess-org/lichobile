import redraw from '../../utils/redraw'
import settings from '../../settings'
import formWidgets from '../shared/form'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import router from '../../router'
import * as utils from '../../utils'

import { IChessClock, ClockType } from './interfaces'

interface IClockSettingsCtrl {
  open(): void
  close(fromBB?: string): void
  isOpen(): boolean
  reload(): void
  addStage(): void
  removeStage(): void
}

export default {

  controller(reload: () => void, clockObj: Mithril.Stream<IChessClock>): IClockSettingsCtrl {
    let isOpen = false

    function open() {
      if (clockObj().isRunning() && !clockObj().flagged()) return

      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    function addStage () {
      let stages = settings.clock.stage.stages()
      stages[stages.length - 1].moves = stages[stages.length - 2].moves
      stages.push({time: stages[stages.length - 1].time, moves: null})
      settings.clock.stage.stages(stages)
      redraw()
    }

    function removeStage () {
      let stages = settings.clock.stage.stages()
      if (stages.length <= 2)
        return
      stages.pop()
      settings.clock.stage.stages(stages)
      redraw()
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen
      },
      reload,
      addStage,
      removeStage
    }
  },

  view(ctrl: IClockSettingsCtrl) {

    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game clock_settings',
        undefined,
        function() {
          return (
            <div>
              <div className="action">
                <div className="select_input">
                  {formWidgets.renderSelect('Clock', 'clock', settings.clock.availableClocks, settings.clock.clockType, false, onChange)}
                </div>
                {clockSettingsView[settings.clock.clockType() as ClockType](ctrl)}
              </div>
              <button className="newClockButton" data-icon="E" oncreate={helper.ontap(function () {
                  ctrl.reload()
                  ctrl.close()
                })}>
                Set Clock
              </button>
            </div>
          )
        },
        ctrl.isOpen(),
        ctrl.close
      )
    }

    return null
  }
}

const clockSettingsView = {
  simple(_: IClockSettingsCtrl) {
    return (
      <div key="simpleSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.simple.time, false, onChange)}
        </div>
      </div>
    )
  },
  increment(_: IClockSettingsCtrl) {
    return (
      <div key="incrementSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.increment.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.increment.increment, false, onChange)}
        </div>
      </div>
    )
  },
  handicapInc(_: IClockSettingsCtrl) {
    return (
      <div key="handicapIncSettings" className="clockSettingParameters">
        <div className="handicapRow">
          <div className="handicapRowTitle">Top</div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Time', 'topTime', settings.clock.availableTimes, settings.clock.handicapInc.topTime, false, onChange)}
          </div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Increment', 'topIncrement', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.handicapInc.topIncrement, false, onChange)}
          </div>
        </div>
        <div className="handicapRow">
          <div className="handicapRowTitle">Bottom</div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Time', 'bottomTime', settings.clock.availableTimes, settings.clock.handicapInc.bottomTime, false, onChange)}
          </div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Increment', 'bottomIncrement', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.handicapInc.bottomIncrement, false, onChange)}
          </div>
        </div>
      </div>
    )
  },
  delay(_: IClockSettingsCtrl) {
    return (
      <div key="delaySettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.delay.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.delay.increment, false, onChange)}
        </div>
      </div>
    )
  },
  bronstein(_: IClockSettingsCtrl) {
    return (
      <div key="bronsteinSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.bronstein.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.bronstein.increment, false, onChange)}
        </div>
      </div>
    )
  },
  hourglass(_: IClockSettingsCtrl) {
    return (
      <div key="hourglassSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.hourglass.time, false, onChange)}
        </div>
      </div>
    )
  },
  stage(ctrl: IClockSettingsCtrl) {
    return (
      <div key="hourglassSettings" className="clockSettingParameters">
        { settings.clock.stage.stages().map(renderStage.bind(undefined, ctrl)) }
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.stage.increment, false, onChange)}
        </div>
      </div>
    )
  }
}

function renderStage(ctrl: IClockSettingsCtrl, _: number, index: number) {
  const time = updateTime.bind(undefined, index)
  const moves = updateMoves.bind(undefined, index)
  const hidePlus = settings.clock.stage.stages().length >= 5
  const hideMinus = settings.clock.stage.stages().length <= 2
  return (
    <div className="stageRow">
      <div className="stageRowTitle">{index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, time, false, onChange)}
      </div>
      <div className={'select_input inline stage stageRowMember' + ((index === settings.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', settings.clock.availableMoves.map(utils.tupleOf), moves, false, onChange)}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === settings.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        <span  className={'fa fa-plus-square-o' + (hidePlus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => ctrl.addStage())}/> <span className={'fa fa-minus-square-o' + (hideMinus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => ctrl.removeStage())}/>
      </div>
    </div>
  )
}

function updateTime(index: number, time: string) {
  let stages = settings.clock.stage.stages()

  if (time) {
    stages[index].time = time
    settings.clock.stage.stages(stages)
  }
  return stages[index].time
}

function updateMoves (index: number, moves: string) {
  let stages = settings.clock.stage.stages()
  if (moves) {
    stages[index].moves = moves
    settings.clock.stage.stages(stages)
  }

  return stages[index].moves
}

function onChange () {
  window.StatusBar.hide()
  redraw()
}
