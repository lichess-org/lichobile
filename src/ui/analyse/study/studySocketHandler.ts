import redraw from '../../../utils/redraw'
import { currentSri } from '../../../utils'
import { ChatMsg } from '../../../lichess/interfaces/chat'

import analyseSocketHandler from '../analyseSocketHandler'
import StudyCtrl from './StudyCtrl'

export default function(ctrl: StudyCtrl) {
  return {
    ...analyseSocketHandler(ctrl.rootCtrl),

    liking(d: Liking) {
      ctrl.data.likes = d.l.likes
      if (d.w && d.w.s === currentSri()) ctrl.data.liked = d.l.me
      redraw()
    },

    message(msg: ChatMsg) {
      if (ctrl.chat) ctrl.chat.append(msg)
    },
  }
}

interface Liking {
  readonly l: {
    readonly likes: number
    readonly me: boolean
  }
  readonly w: {
    readonly u: string
    readonly s: string
  }
}
