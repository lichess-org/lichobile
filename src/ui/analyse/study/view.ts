import h from 'mithril/hyperscript'
import { linkify } from '../../../utils/html'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'
import StudyCtrl from './StudyCtrl'

export function renderReadonlyComments(ctrl: AnalyseCtrl) {
  const comments = ctrl.node.comments || []
  return h('div.native_scroller.study-comments', comments.map(c =>
    h('div.study-comment', [
      h('div.by', (typeof c.by === 'string' ? c.by : c.by.name) + ':'),
      h('div', h.trust(linkify(c.text)))
    ])
  ))
}

export function renderPgnTags(ctrl: AnalyseCtrl) {
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

export function renderReplayActions(ctrl: StudyCtrl) {
  const nbComments = ctrl.rootCtrl.node.comments && ctrl.rootCtrl.node.comments.length || 0
  const selected = ctrl.vm.showComments
  return h('div.study-replayActions', [
    h('button.fa.fa-comment-o', {
      className: selected ? 'selected' : '',
      oncreate: helper.ontap(ctrl.toggleShowComments)
    }, nbComments > 0 ? h('span.chip', nbComments) : null),
  ])
}
