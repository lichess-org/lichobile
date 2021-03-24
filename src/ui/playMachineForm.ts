import * as utils from '../utils'
import { parseFen, makeFen } from 'chessops/fen'
import router from '../router'
import * as xhr from '../xhr'
import redraw from '../utils/redraw'
import settings, { AiSettings } from '../settings'
import formWidgets from './shared/form'
import popupWidget from './shared/popup'
import i18n from '../i18n'
import ViewOnlyBoard from './shared/ViewOnlyBoard'
import * as helper from './helper'
import h from 'mithril/hyperscript'

let isOpen = false
let setupFen: string | false | undefined

export default {
  open,

  close,

  openAIFromPosition(fen: string) {
    settings.gameSetup.ai.variant('3')
    open()
    setupFen = fen
  },

  view() {
    function form() {
      return renderForm(
        'ai',
        settings.gameSetup.ai,
        settings.gameSetup.ai.availableVariants,
        settings.gameSetup.ai.availableTimeModes
      )
    }

    return popupWidget(
      'game_form_popup',
      undefined,
      form,
      isOpen,
      close
    )
  }

}

function open() {
  router.backbutton.stack.push(close)
  setupFen = undefined
  isOpen = true
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function startAIGame() {
  return xhr.newAiGame(setupFen)
  .then((data) => {
    router.set('/game' + data.url.round)
  })
  .catch(utils.handleXhrError)
}

const colors = [
  ['randomColor', 'random'],
  ['white', 'white'],
  ['black', 'black']
]

function renderForm(formName: string, settingsObj: AiSettings, variants: string[][], timeModes: string[][]) {
  const timeMode = settingsObj.timeMode()
  const hasClock = timeMode === '1'

  const generalFieldset = [
    h('div.select_input', [
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ]),
    h('div.select_input', [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ]),
    settingsObj.variant() === '3' ?
    h('div.setupPosition', [
      h('div.setupPositionInput', [
        h('input[type=text][name=fen]', {
          placeholder: i18n('pasteTheFenStringHere'),
          oninput: (e: Event) => {
            const rawfen = (e.target as HTMLInputElement).value
            if (rawfen === '') {
              setupFen = undefined
            } else {
              setupFen = parseFen(rawfen).unwrap(s => makeFen(s), () => false)
            }
            redraw()
          }
        }),
        h('button.withIcon', {
          oncreate: helper.ontap(() => {
            close()
            router.set('/editor')
          })
        }, h('span.fa.fa-pencil')),
      ]),

      setupFen === false ?
        h('div.setupFenError', 'Invalid FEN') : null,

      setupFen !== undefined && setupFen !== false ? [
        h('div', {
          style: {
            width: '100px',
            height: '100px'
          },
          oncreate: helper.ontap(() => {
            close()
            if (setupFen) router.set(`/editor/${encodeURIComponent(setupFen)}`)
          })
        }, [
          h(ViewOnlyBoard, { fen: setupFen, orientation: 'white'})
        ])
      ] : null
    ]) : null,
    h('div.select_input', [
      formWidgets.renderSelect('level', 'ailevel', [
        '1', '2', '3', '4', '5', '6', '7', '8'
      ].map(utils.tupleOf), settingsObj.level)
    ])
  ]

  const timeFieldset = [
    h('div.select_input', [
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ]

  if (hasClock) {
    timeFieldset.push(
      h('div.select_input.inline', [
        formWidgets.renderSelect('time', formName + 'time',
          settings.gameSetup.availableTimes, settingsObj.time, false)
      ]),
      h('div.select_input.inline', [
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.gameSetup.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      ])
    )
  }

  return h('form.game_form', {
    onsubmit: function(e: Event) {
      e.preventDefault()
      if (!settings.gameSetup.isTimeValid(settingsObj)) return
      close()
      startAIGame()
    }
  }, [
    h('fieldset', generalFieldset),
    h('fieldset', timeFieldset),
    h('div.popupActionWrapper', [
      h('button.defaultButton[type=submit]', i18n('playWithTheMachine'))
    ])
  ])
}
