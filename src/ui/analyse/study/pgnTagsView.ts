import * as h from 'mithril/hyperscript'
import { linkify } from '../../../utils/html'

import AnalyseCtrl from '../AnalyseCtrl'


export default function renderPgnTags(ctrl: AnalyseCtrl) {
  const study = ctrl.study
  if (!study) return h('div', 'oops! nothing to see here')

  return h('div.native_scroller', [
    h('table.study-tags', [
      h('tbody', study.data.chapter.tags.map(([tagName, tagValue]) =>
        h('tr.study-tag', [
          h('th', tagName),
          h('td', h.trust(linkify(tagValue)))
      ])))
    ])
  ])
}
