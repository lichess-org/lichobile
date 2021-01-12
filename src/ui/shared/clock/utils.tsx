import h from 'mithril/hyperscript'
import { formatTimeInSecs } from '../../../utils'
import { ClockType, IChessClock, IStageClock, StageSetting } from './interfaces'
import settings, { Prop } from '../../../settings'
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

export function addStage (stagesSetting: Prop<Array<StageSetting>>) {
  const stages = stagesSetting()
  stages[stages.length - 1].moves = stages[stages.length - 2].moves
  stages.push({time: stages[stages.length - 1].time, moves: null})
  stagesSetting(stages)
  redraw()
}

export function removeStage (stagesSetting: Prop<Array<StageSetting>>) {
  const stages = stagesSetting()
  if (stages.length <= 2)
    return
  stages.pop()
  stagesSetting(stages)
  redraw()
}

export function clockSettingsView (clockType: ClockType | 'none', onChange: () => void) {
  const clockTypes = {
    none() {
      return('')
    },
    simple() {
      return (
        <div className="clockSettingParameters">
        <div className="select_input">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.simple.time, false, onChange)}
        </div>
        </div>
      )
    },
    increment() {
      return (
        <div className="clockSettingParameters">
        <div className="select_input">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.increment.time, false, onChange)}
        </div>
        <div className="select_input">
        {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.increment.increment, false, onChange)}
        </div>
        </div>
      )
    },
    handicapInc() {
      return (
        <div className="clockSettingParameters">
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
    delay() {
      return (
        <div className="clockSettingParameters">
        <div className="select_input">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.delay.time, false, onChange)}
        </div>
        <div className="select_input">
        {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.delay.increment, false, onChange)}
        </div>
        </div>
      )
    },
    bronstein() {
      return (
        <div className="clockSettingParameters">
        <div className="select_input">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.bronstein.time, false, onChange)}
        </div>
        <div className="select_input">
        {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.bronstein.increment, false, onChange)}
        </div>
        </div>
      )
    },
    hourglass() {
      return (
        <div className="clockSettingParameters">
        <div className="select_input">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, settings.clock.hourglass.time, false, onChange)}
        </div>
        </div>
      )
    },
    stage() {
      return (
        <div className="clockSettingParameters">
        { settings.clock.stage.stages().map((_, index) => renderStage(onChange, index)) }
        <div className="select_input">
        {formWidgets.renderSelect('Increment', 'increment', settings.clock.availableIncrements.map(utils.tupleOf), settings.clock.stage.increment, false, onChange)}
        </div>
        </div>
      )
    }
  }

  return clockTypes[clockType]()
}

function renderStage(onChange: () => void, index: number) {
  const timeProp = updateTime.bind(undefined, index) as Prop<string>
  const moves = updateMoves.bind(undefined, index) as Prop<string>
  const hidePlus = settings.clock.stage.stages().length >= 5
  const hideMinus = settings.clock.stage.stages().length <= 2
  return (
    <div className="stageRow">
      <div className="stageRowTitle">{index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', settings.clock.availableTimes, timeProp, false, onChange)}
      </div>
      <div className={'select_input inline stage stageRowMember' + ((index === settings.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', settings.clock.availableMoves.map(utils.tupleOf), moves, false, onChange)}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === settings.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        <span  className={'fa fa-plus-square-o' + (hidePlus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => addStage(settings.clock.stage.stages))}/> <span className={'fa fa-minus-square-o' + (hideMinus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => removeStage(settings.clock.stage.stages))}/>
      </div>
    </div>
  )
}

function updateTime(index: number, time: string) {
  const stages = settings.clock.stage.stages()

  if (time) {
    stages[index].time = time
    settings.clock.stage.stages(stages)
  }
  return stages[index].time
}

function updateMoves (index: number, moves: string) {
  const stages = settings.clock.stage.stages()
  if (moves) {
    stages[index].moves = moves
    settings.clock.stage.stages(stages)
  }

  return stages[index].moves
}
