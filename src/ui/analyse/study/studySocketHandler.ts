import redraw from '../../../utils/redraw'
import { currentSri } from '../../../utils'

import StudyCtrl from './StudyCtrl'

export default function(ctrl: StudyCtrl) {
  return {
    liking(d: Liking) {
      ctrl.data.likes = d.l.likes
      if (d.w && d.w.s === currentSri()) ctrl.data.liked = d.l.me
      redraw()
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
