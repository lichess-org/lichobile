import * as h from 'mithril/hyperscript'
import signals from '../../signals'
import { handleXhrError } from '../../utils'
import * as helper from '../helper'
import layout from '../layout'
import { emptyFen } from '../../utils/fen'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import { connectingHeader } from '../shared/common'

import { renderContent, renderHeader, overlay } from './trainingView'
import * as xhr from './xhr'
import TrainingCtrl from './TrainingCtrl'

interface Attrs {
  id?: string
  initFen?: string
  initColor?: Color
}

interface State {
  ctrl: TrainingCtrl
}

export default {
  oninit({ attrs }) {
    if (attrs.id) {
      xhr.loadPuzzle(Number(attrs.id))
      .then(cfg => {
        this.ctrl = new TrainingCtrl(cfg)
      })
      .catch(handleXhrError)
    } else {
      xhr.newPuzzle()
      .then(cfg => {
        this.ctrl = new TrainingCtrl(cfg)
      })
      .catch(handleXhrError)
    }
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
        () => renderHeader(this.ctrl),
        () => renderContent(this.ctrl, key, bounds),
        () => overlay(this.ctrl)
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
