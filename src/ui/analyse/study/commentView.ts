import * as h from 'mithril/hyperscript'
import { linkify } from '../../../utils/html'

import AnalyseCtrl from '../AnalyseCtrl'


export default function renderComments(ctrl: AnalyseCtrl) {
  const comments = ctrl.node.comments || []
  return h('div.native_scroller.study-comments', comments.map(c =>
    h('div.study-comment', [
      h('div.by', (typeof c.by === 'string' ? c.by : c.by.name) + ':'),
      h('div', h.trust(linkify(c.text)))
    ])
  ))
}
