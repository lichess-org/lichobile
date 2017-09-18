import * as utils from '../utils'
import router from '../router'
import * as xhr from '../xhr'
import settings, { HumanSettings } from '../settings'
import spinner from '../spinner'
import session from '../session'
import redraw from '../utils/redraw'
import * as helper from './helper'
import formWidgets from './shared/form'
import popupWidget from './shared/popup'
import i18n from '../i18n'
import lobby from './lobby'
import * as h from 'mithril/hyperscript'
import { humanSetupFromSettings } from '../lichess/setup'
import { Pool, PoolMember, HumanSeekSetup, isPoolMember, isSeekSetup } from '../lichess/interfaces'

let isOpen = false

const humanSetup = settings.gameSetup.human

// cached tab preset
let tabPreset: string = humanSetup.preset()
// to restore previous if changed programmatically
// null means don't restore previous on close
let previousTabPreset: string | null = null

export default {
  open,

  close,

  openRealTime() {
    humanSetup.timeMode('1')
    open()
  },

  openCorrespondence() {
    previousTabPreset = tabPreset
    tabPreset = 'custom'
    humanSetup.timeMode('2')
    open()
  },

  view() {
    return popupWidget(
      'new_game_form_popup game_form_popup',
      undefined,
      renderContent,
      isOpen,
      close
    )
  }
}

function open() {
  if (xhr.cachedPools.length === 0) {
    xhr.lobby(false).then(redraw)
  }
  router.backbutton.stack.push(close)
  isOpen = true
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
  if (previousTabPreset) {
    tabPreset = previousTabPreset
    previousTabPreset = null
  }
}

function goSeek(conf: PoolMember | HumanSeekSetup) {
  close()

  // pool or real time seek
  if (isPoolMember(conf)) {
    lobby.startSeeking(conf)
  }
  // correspondence or unlimited seek
  else if (isSeekSetup(conf) && conf.timeMode === 1) {
    lobby.startSeeking(conf)
  }
  // correspondence seek
  else {
    xhr.seekGame(conf)
    .then(() => router.set('/correspondence'))
    .catch(utils.handleXhrError)
  }
}

function renderContent() {

  const conf = humanSetup

  const handleTabTap = (e: Event) => utils.autoredraw(() => {
    const val = (e.target as any).value
    tabPreset = val
    conf.preset(val)
  })

  return h('div', [
    h('div.newGame-preset_switch', [
      h('div.nice-radio', formWidgets.renderRadio(
        'Quick game',
        'preset',
        'quick',
        tabPreset === 'quick',
        handleTabTap
      )),
      h('div.nice-radio', formWidgets.renderRadio(
        'Custom',
        'preset',
        'custom',
        tabPreset === 'custom',
        handleTabTap
      ))
    ]),
    tabPreset === 'quick' ?
    renderQuickSetup() :
    renderCustomSetup(
      'human',
      conf,
      conf.availableVariants,
      conf.availableTimeModes.filter((e) => {
        // correspondence and unlimited time modes are only available when
        // connected
        return e[1] === '1' || session.isConnected()
      })
    ),
  ])
}

function renderQuickSetup() {
  return h('div.newGame-pools', { key: 'quickSetup' }, xhr.cachedPools.length ?
    xhr.cachedPools
      .map(p => renderPool(p))
      .concat(h('div.newGame-pool', {
          key: 'pool-custom',
          oncreate: helper.ontap(() => {
            tabPreset = 'custom'
            humanSetup.preset('custom')
          })
        }, h('div.newGame-custom', 'Custom'))
      ) : spinner.getVdom()
  )
}

function renderPool(p: Pool) {
  return h('div.newGame-pool', {
    key: 'pool-' + p.id,
    oncreate: helper.ontap(() => {
      // remember pool id for new opponent button
      humanSetup.pool(p.id)
      goSeek({ id: p.id })
      close()
    })
  }, [
    h('div.newGame-clock', p.id),
    h('div.newGame-perf', p.perf)
  ])
}

function renderCustomSetup(formName: string, settingsObj: HumanSettings, variants: string[][], timeModes: string[][]) {
  const timeMode = settingsObj.timeMode()
  const hasClock = timeMode === '1'
  const hasDays = timeMode === '2' && session.isConnected()

  // be sure to set real time clock if disconnected
  if (!session.isConnected()) {
    humanSetup.timeMode('1')
  }
  if (timeMode === '0') {
    humanSetup.mode('0')
  }

  // if mode is rated only allow random color
  let colors: string[][]
  if (settingsObj.mode() === '1') {
    settingsObj.color('random')
    colors = [
      ['randomColor', 'random']
    ]
  } else {
    colors = [
      ['randomColor', 'random'],
      ['white', 'white'],
      ['black', 'black']
    ]
  }

  const modes = (session.isConnected() && timeMode !== '0') ? [
    ['casual', '0'],
    ['rated', '1']
  ] : [
    ['casual', '0']
  ]

  const generalFieldset = [
    h('div.select_input', {
      key: formName + 'color'
    },
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ),
    h('div.select_input', {
      key: formName + 'variant'
    },
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    )
  ]

  generalFieldset.push(h('div.select_input', {
    key: formName + 'mode'
  },
    formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
  ))

  if (session.isConnected()) {
    generalFieldset.push(
      h('div.rating_range', {
        key: 'rating_range'
      }, [
        h('div.title', i18n('ratingRange')),
        h('div.select_input.inline',
          formWidgets.renderSelect('Min', formName + 'rating_min',
            humanSetup.availableRatingRanges.min, settingsObj.ratingMin, false)
        ),
        h('div.select_input.inline',
          formWidgets.renderSelect('Max', formName + 'rating_max',
            humanSetup.availableRatingRanges.max, settingsObj.ratingMax, false)
        )
      ])
    )
  }

  const timeFieldset = [
    h('div.select_input', {
      key: formName + 'timeMode'
    },
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    )
  ]

  if (hasClock) {
    timeFieldset.push(
      h('div.select_input.inline', {
        key: formName + 'time'
      },
        formWidgets.renderSelect('time', formName + 'time',
          settings.gameSetup.availableTimes, settingsObj.time, false)
      ),
      h('div.select_input.inline', {
        key: formName + 'increment'
      },
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.gameSetup.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      )
    )
  }

  if (hasDays) {
    timeFieldset.push(
      h('div.select_input.large_label', {
        key: formName + 'days'
      }, formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.gameSetup.availableDays.map(utils.tupleOf), settingsObj.days!, false)
      ))
  }

  return h('form.game_form', {
    key: 'customSetup',
    onsubmit(e: Event) {
      e.preventDefault()
      if (!settings.gameSetup.isTimeValid(settingsObj)) return
      close()
      // TODO just use localstorage as settings saver
      goSeek(humanSetupFromSettings(settingsObj))
    }
  }, [
    h('fieldset', generalFieldset),
    h('fieldset', timeFieldset),
    h('div.popupActionWrapper', [
      h('button[data-icon=E][type=submit].popupAction', i18n('createAGame'))
    ])
  ])
}
