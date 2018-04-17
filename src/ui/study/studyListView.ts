import * as h from 'mithril/hyperscript'
import spinner from '../../spinner'
import * as helper from '../helper'

import StudyListCtrl, { PagerDataWithDate } from './StudyListCtrl'

export default function studyListView(ctrl: StudyListCtrl) {
  const studies = ctrl.state ? ctrl.state.studies : []

  return h('div#scroller-wrapper.native_scroller.study-pagerScroller', {
    oncreate: helper.ontapY(e => onTap(ctrl, e!), undefined, helper.getLI)
  }, studies.length ?
    h('ul', studies.map((study, index) =>
      h(Item, { study, index })
    )) :
    h('div.study-pagerLoader', spinner.getVdom('monochrome'))
  )
}

function onTap(ctrl: StudyListCtrl, e: Event) {
  const el = helper.getLI(e)
  const id = el && el.dataset.id
  if (id) {
    ctrl.goToStudy(id)
  }
}

const Item = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.study !== oldattrs.study
  },
  view({ attrs }) {
    const { study, index } = attrs

    return h('li.study-pagerItem', {
      className: index % 2 === 0 ? 'even' : 'odd',
      'data-id': study.id
    }, [
      h('div.study-pagerItemTitle', [
        h('i[data-icon=4]'),
        h('div', [
          h('h2', study.name),
          h('h3', [
            h('i.fa', {
              className: study.liked ? 'fa-heart' : 'fa-heart-o'
            }),
            h('span', ` ${study.likes} • ${study.owner.name} • ${study.date}`)
          ])
        ])
      ]),
      h('div.study-pagerItemBody', [
        h('ul.chapters', study.chapters.map(c =>
          h('li', [h('span.fa.fa-circle-o'), c])
        )),
        h('ul.members', study.members.map(m =>
          h('li.withIcon', {
            'data-icon': m.role === 'w' ? '' : 'v'
          }, m.user.name)
        )),
      ])
    ])
  }
} as Mithril.Component<{
  study: PagerDataWithDate
  index: number
}, {}>

