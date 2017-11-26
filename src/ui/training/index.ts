import * as h from 'mithril/hyperscript'
import signals from '../../signals'
import socket from '../../socket'
import redraw from '../../utils/redraw'
import { handleXhrError, safeStringToNum } from '../../utils'
import { emptyFen } from '../../utils/fen'
import * as helper from '../helper'
import layout from '../layout'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import { syncPuzzles } from './utils'
import { renderContent, renderHeader, overlay } from './trainingView'
import * as xhr from './xhr'
import TrainingCtrl from './TrainingCtrl'
import { connectingHeader } from '../shared/common'
import router from '../../router'
import settings from '../../settings'
import { loadNextPuzzle } from './utils'

interface Attrs {
  id?: string
  initFen?: string
  initColor?: Color
}

interface State {
  ctrl?: TrainingCtrl
}

// cache last state to retrieve it when navigating back
const cachedState: State = {}

function loadOfflinePuzzle() {
  const cfg = loadNextPuzzle()
  if (cfg !== null) {
    this.ctrl = new TrainingCtrl(cfg)
    cachedState.ctrl = this.ctrl
  }
  else {
    window.plugins.toast.show(`No puzzles available. Go online to get another ${settings.training.puzzleBufferLen}`, 'short', 'center')
    router.set('/')
  }
}

export default {
  oninit({ attrs }) {
    const numId = safeStringToNum(attrs.id)
    if (numId !== undefined) {
      if (cachedState.ctrl && window.history.state.puzzleId === numId) {
        this.ctrl = cachedState.ctrl
        redraw()
      }
      else {
        xhr.loadPuzzle(numId)
        .then(cfg => {
          this.ctrl = new TrainingCtrl(cfg)
          cachedState.ctrl = this.ctrl
        })
        .catch(handleXhrError)
      }
    } else {
      syncPuzzles().then(loadOfflinePuzzle.bind(this), loadOfflinePuzzle.bind(this))
    }

    socket.createDefault()
    window.plugins.insomnia.keepAwake()
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    if (this.ctrl) {
      signals.afterLogin.remove(this.ctrl.retry)
    }
    window.plugins.insomnia.allowSleepAgain()
  },

  view({ attrs }) {
    const isPortrait = helper.isPortrait()
    const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'training')
    const key = isPortrait ? 'o-portrait' : 'o-landscape'

    if (this.ctrl) {
      return layout.board(
        () => renderHeader(this.ctrl!),
        () => renderContent(this.ctrl!, key, bounds),
        () => overlay(this.ctrl!)
      )
    }
    else {
      return layout.board(
        connectingHeader,
        () => h.fragment({ key: key + '-no-data' }, [
          h('section.board_wrapper', [
            h(ViewOnlyBoard, {
              fen: attrs.initFen || emptyFen,
              orientation: attrs.initColor || 'white',
              bounds
            })
          ])
        ])
      )
    }
  }
} as Mithril.Component<Attrs, State>
