import { formatTimeInSecs } from '../../../utils'
import { ClockType, IChessClock, IStageClock, ClockSettings, StageSetting } from './interfaces'
import { SettingsProp } from '../../../settings'
import redraw from '../../../utils/redraw'
import * as helper from '../../helper'
import * as utils from '../../../utils'
import formWidgets from '../../shared/form'

export const MILLIS = 1000
export const MINUTE_MILLIS = 60 * 1000
export const CLOCK_TICK_STEP = 100

export function formatTime(clockType: ClockType, time: number) {
  if (clockType === 'hourglass') {
    return formatTimeInSecs(Math.round(time))
  } else {
    return formatTimeInSecs(Math.floor(time))
  }
}

export function isStageClock(c: IChessClock): c is IStageClock {
  return (c as IStageClock).whiteMoves !== undefined
}

export function addStage (stagesSetting: SettingsProp<Array<StageSetting>>) {
  let stages = stagesSetting()
  stages[stages.length - 1].moves = stages[stages.length - 2].moves
  stages.push({time: stages[stages.length - 1].time, moves: null})
  stagesSetting(stages)
  redraw()
}

export function removeStage (stagesSetting: SettingsProp<Array<StageSetting>>) {
  let stages = stagesSetting()
  if (stages.length <= 2)
    return
  stages.pop()
  stagesSetting(stages)
  redraw()
}

export function clockSettingsView (clockSettings: ClockSettings, onChange: () => void) {
  let clockTypes = {
    none() {
      return('')
    },
    simple() {
      return (
        <div key="simpleSettings" className="clockSettingParameters">
          <div className="select_input">
            {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, clockSettings.simple.time, false, onChange)}
          </div>
        </div>
      )
    },
    increment() {
      return (
        <div key="incrementSettings" className="clockSettingParameters">
          <div className="select_input">
            {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, clockSettings.increment.time, false, onChange)}
          </div>
          <div className="select_input">
            {formWidgets.renderSelect('Increment', 'increment', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.increment.increment, false, onChange)}
          </div>
        </div>
      )
    },
    handicapInc() {
      return (
        <div key="handicapIncSettings" className="clockSettingParameters">
          <div className="handicapRow">
            <div className="handicapRowTitle">Top</div>
            <div className="select_input inline handicapRowMember">
              {formWidgets.renderSelect('Time', 'topTime', clockSettings.availableTimes, clockSettings.handicapInc.topTime, false, onChange)}
            </div>
            <div className="select_input inline handicapRowMember">
              {formWidgets.renderSelect('Increment', 'topIncrement', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.handicapInc.topIncrement, false, onChange)}
            </div>
          </div>
          <div className="handicapRow">
            <div className="handicapRowTitle">Bottom</div>
            <div className="select_input inline handicapRowMember">
              {formWidgets.renderSelect('Time', 'bottomTime', clockSettings.availableTimes, clockSettings.handicapInc.bottomTime, false, onChange)}
            </div>
            <div className="select_input inline handicapRowMember">
              {formWidgets.renderSelect('Increment', 'bottomIncrement', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.handicapInc.bottomIncrement, false, onChange)}
            </div>
          </div>
        </div>
      )
    },
    delay() {
      return (
        <div key="delaySettings" className="clockSettingParameters">
          <div className="select_input">
            {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, clockSettings.delay.time, false, onChange)}
          </div>
          <div className="select_input">
            {formWidgets.renderSelect('Increment', 'increment', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.delay.increment, false, onChange)}
          </div>
        </div>
      )
    },
    bronstein() {
      return (
        <div key="bronsteinSettings" className="clockSettingParameters">
          <div className="select_input">
            {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, clockSettings.bronstein.time, false, onChange)}
          </div>
          <div className="select_input">
            {formWidgets.renderSelect('Increment', 'increment', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.bronstein.increment, false, onChange)}
          </div>
        </div>
      )
    },
    hourglass() {
      return (
        <div key="hourglassSettings" className="clockSettingParameters">
          <div className="select_input">
            {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, clockSettings.hourglass.time, false, onChange)}
          </div>
        </div>
      )
    },
    stage() {
      return (
        <div key="hourglassSettings" className="clockSettingParameters">
          { clockSettings.stage.stages().map(renderStage.bind(undefined, clockSettings, onChange)) }
          <div className="select_input">
            {formWidgets.renderSelect('Increment', 'increment', clockSettings.availableIncrements.map(utils.tupleOf), clockSettings.stage.increment, false, onChange)}
          </div>
        </div>
      )
    }
  }

  return clockTypes[clockSettings.clockType()]()
}

function renderStage(clockSettings: ClockSettings, onChange: () => void, _: number, index: number) {
  const time = updateTime.bind(undefined, clockSettings, index)
  const moves = updateMoves.bind(undefined, clockSettings, index)
  const hidePlus = clockSettings.stage.stages().length >= 5
  const hideMinus = clockSettings.stage.stages().length <= 2
  return (
    <div className="stageRow">
      <div className="stageRowTitle">{index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', clockSettings.availableTimes, time, false, onChange)}
      </div>
      <div className={'select_input inline stage stageRowMember' + ((index === clockSettings.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', clockSettings.availableMoves.map(utils.tupleOf), moves, false, onChange)}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === clockSettings.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        <span  className={'fa fa-plus-square-o' + (hidePlus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => addStage(clockSettings.stage.stages))}/> <span className={'fa fa-minus-square-o' + (hideMinus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => removeStage(clockSettings.stage.stages))}/>
      </div>
    </div>
  )
}

function updateTime(clockSettings: ClockSettings, index: number, time: string) {
  let stages = clockSettings.stage.stages()

  if (time) {
    stages[index].time = time
    clockSettings.stage.stages(stages)
  }
  return stages[index].time
}

function updateMoves (clockSettings: ClockSettings, index: number, moves: string) {
  let stages = clockSettings.stage.stages()
  if (moves) {
    stages[index].moves = moves
    clockSettings.stage.stages(stages)
  }

  return stages[index].moves
}
