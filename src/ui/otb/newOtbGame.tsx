import * as h from 'mithril/hyperscript'
import i18n from '../../i18n'
import router from '../../router'
import settings from '../../settings'
import getVariant, { specialFenVariants } from '../../lichess/variant'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import formWidgets from '../shared/form'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import * as stream from 'mithril/stream'
import redraw from '../../utils/redraw'
import * as utils from '../../utils'
import { OtbRoundInterface } from '../shared/round'
import { ClockType } from '../shared/clock/interfaces'

export interface NewOtbGameCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: Mithril.Stream<boolean>
  root: OtbRoundInterface
  addStage(): void
  removeStage(): void
}

export default {

  controller(root: OtbRoundInterface) {
    const isOpen = stream(false)

    function open() {
      router.backbutton.stack.push(close)
      isOpen(true)
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen() === true) router.backbutton.stack.pop()
      isOpen(false)
    }

    function addStage () {
      let stages = settings.otb.clock.stage.stages()
      stages[stages.length - 1].moves = stages[stages.length - 2].moves
      stages.push({time: stages[stages.length - 1].time, moves: null})
      settings.otb.clock.stage.stages(stages)
      redraw()
    }

    function removeStage () {
      let stages = settings.otb.clock.stage.stages()
      if (stages.length <= 2)
        return
      stages.pop()
      settings.otb.clock.stage.stages(stages)
      redraw()
    }

    return {
      open,
      close,
      isOpen,
      root,
      addStage,
      removeStage
    }
  },

  view: function(ctrl: NewOtbGameCtrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        undefined,
        function() {
          const availVariants = settings.otb.availableVariants
          const variants = ctrl.root.vm.setupFen ?
            availVariants.filter(i => !specialFenVariants.has(i[1])) :
            availVariants

          const setupVariant = settings.otb.variant()
          const hasSpecialSetup = ctrl.root.vm.setupFen && specialFenVariants.has(setupVariant)

          return (
            <div>
              <div className="action">
                {hasSpecialSetup ?
                  <div className="select_input disabled">
                    <label for="variant">{i18n('variant')}</label>
                    <select disabled id="variant">
                      <option value={setupVariant} selected>
                        {getVariant(setupVariant).name}
                      </option>
                    </select>
                  </div> :
                  <div className="select_input">
                    {formWidgets.renderSelect('variant', 'variant', variants, settings.otb.variant)}
                  </div>
                }
                { ctrl.root.vm.setupFen ?
                  <div className="from_position_wrapper">
                    <p>{i18n('fromPosition')}</p>
                    <div className="from_position">
                      <div
                        style={{
                          width: '130px',
                          height: '130px'
                        }}
                        oncreate={helper.ontap(() => {
                          if (ctrl.root.vm.setupFen)
                            router.set(`/editor/${encodeURIComponent(ctrl.root.vm.setupFen)}`)
                        })}
                      >
                        {h(ViewOnlyBoard, { fen: ctrl.root.vm.setupFen, orientation: 'white', bounds: { width: 130, height: 130 }})}
                      </div>
                    </div>
                  </div> : null
                }
                <div className="select_input">
                  {formWidgets.renderSelect('Clock', 'clock', settings.otb.availableClocks, settings.otb.clock.clockType, false, onChange)}
                </div>
                {console.log(settings.otb.clock.clockType())}
                {clockSettingsView[settings.otb.clock.clockType() as ClockType](ctrl)}
              </div>
              <div className="popupActionWrapper">
                <button className="popupAction" data-icon="E"
                  oncreate={helper.ontap(() =>
                    ctrl.root.startNewGame(settings.otb.variant() as VariantKey, ctrl.root.vm.setupFen))
                  }>
                  {i18n('play')}
                </button>
              </div>
            </div>
          )
        },
        ctrl.isOpen(),
        () => {
          if (ctrl.root.vm.setupFen) {
            router.set('/otb')
          }
          ctrl.close()
        }
      )
    }

    return null
  }
}

const clockSettingsView = {
  none(_ : NewOtbGameCtrl) {
    return('')
  },
  simple(_: NewOtbGameCtrl) {
    return (
      <div key="simpleSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, settings.otb.clock.simple.time, false, onChange)}
        </div>
      </div>
    )
  },
  increment(_: NewOtbGameCtrl) {
    return (
      <div key="incrementSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, settings.otb.clock.increment.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.increment.increment, false, onChange)}
        </div>
      </div>
    )
  },
  handicapInc(_: NewOtbGameCtrl) {
    return (
      <div key="handicapIncSettings" className="clockSettingParameters">
        <div className="handicapRow">
          <div className="handicapRowTitle">Top</div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Time', 'topTime', settings.otb.clock.availableTimes, settings.otb.clock.handicapInc.topTime, false, onChange)}
          </div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Increment', 'topIncrement', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.handicapInc.topIncrement, false, onChange)}
          </div>
        </div>
        <div className="handicapRow">
          <div className="handicapRowTitle">Bottom</div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Time', 'bottomTime', settings.otb.clock.availableTimes, settings.otb.clock.handicapInc.bottomTime, false, onChange)}
          </div>
          <div className="select_input inline handicapRowMember">
            {formWidgets.renderSelect('Increment', 'bottomIncrement', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.handicapInc.bottomIncrement, false, onChange)}
          </div>
        </div>
      </div>
    )
  },
  delay(_: NewOtbGameCtrl) {
    return (
      <div key="delaySettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, settings.otb.clock.delay.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.delay.increment, false, onChange)}
        </div>
      </div>
    )
  },
  bronstein(_: NewOtbGameCtrl) {
    return (
      <div key="bronsteinSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, settings.otb.clock.bronstein.time, false, onChange)}
        </div>
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.bronstein.increment, false, onChange)}
        </div>
      </div>
    )
  },
  hourglass(_: NewOtbGameCtrl) {
    return (
      <div key="hourglassSettings" className="clockSettingParameters">
        <div className="select_input">
          {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, settings.otb.clock.hourglass.time, false, onChange)}
        </div>
      </div>
    )
  },
  stage(ctrl: NewOtbGameCtrl) {
    return (
      <div key="hourglassSettings" className="clockSettingParameters">
        { settings.otb.clock.stage.stages().map(renderStage.bind(undefined, ctrl)) }
        <div className="select_input">
          {formWidgets.renderSelect('Increment', 'increment', settings.otb.clock.availableIncrements.map(utils.tupleOf), settings.otb.clock.stage.increment, false, onChange)}
        </div>
      </div>
    )
  }
}

function renderStage(ctrl: NewOtbGameCtrl, _: number, index: number) {
  const time = updateTime.bind(undefined, index)
  const moves = updateMoves.bind(undefined, index)
  const hidePlus = settings.otb.clock.stage.stages().length >= 5
  const hideMinus = settings.otb.clock.stage.stages().length <= 2
  return (
    <div className="stageRow">
      <div className="stageRowTitle">{index + 1}</div>
      <div className="select_input inline stage stageRowMember">
        {formWidgets.renderSelect('Time', 'time', settings.otb.clock.availableTimes, time, false, onChange)}
      </div>
      <div className={'select_input inline stage stageRowMember' + ((index === settings.otb.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        {formWidgets.renderSelect('Moves', 'moves', settings.otb.clock.availableMoves.map(utils.tupleOf), moves, false, onChange)}
      </div>
      <div className={'stageRowMember addSubtractStage' + ((index === settings.otb.clock.stage.stages().length - 1 ) ? ' lastStage' : '')}>
        <span  className={'fa fa-plus-square-o' + (hidePlus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => ctrl.addStage())}/> <span className={'fa fa-minus-square-o' + (hideMinus ? ' hiddenButton' : '')} oncreate={helper.ontap(() => ctrl.removeStage())}/>
      </div>
    </div>
  )
}

function updateTime(index: number, time: string) {
  let stages = settings.otb.clock.stage.stages()

  if (time) {
    stages[index].time = time
    settings.otb.clock.stage.stages(stages)
  }
  return stages[index].time
}

function updateMoves (index: number, moves: string) {
  let stages = settings.otb.clock.stage.stages()
  if (moves) {
    stages[index].moves = moves
    settings.otb.clock.stage.stages(stages)
  }

  return stages[index].moves
}

function onChange () {
  redraw()
}
