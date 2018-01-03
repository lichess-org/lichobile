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
import { loadOfflinePuzzle, puzzleLoadFailure } from './utils'
import { State } from './interfaces'
import { PuzzleData } from '../../lichess/interfaces/training'
import database from './database'

interface Attrs {
  id?: string
  initFen?: string
  initColor?: Color
}

// cache last state to retrieve it when navigating back
const cachedState: State = {}

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
          this.ctrl = new TrainingCtrl(cfg, database)
          cachedState.ctrl = this.ctrl
        })
        .catch(handleXhrError)
      }
    } else {
      const onSuccess = (cfg: PuzzleData) => {
        this.ctrl = new TrainingCtrl(cfg, database)
        cachedState.ctrl = this.ctrl
      }
      const afterSync = () => loadOfflinePuzzle(database).then(onSuccess, puzzleLoadFailure)
      syncPuzzles(database).then(afterSync, afterSync)
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
