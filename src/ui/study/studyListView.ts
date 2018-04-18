import * as h from 'mithril/hyperscript'
import * as throttle from 'lodash/throttle'
import spinner from '../../spinner'
import * as playerApi from '../../lichess/player'
import { PagerCategory, PagerOrder } from '../../lichess/interfaces/study'
import * as helper from '../helper'

import StudyListCtrl, { PagerDataWithDate } from './StudyListCtrl'

export default function studyListView(ctrl: StudyListCtrl) {
  return h('div.study-pagerWrapper', [
    h('div.study-pagerSubHeader', [
      h('div.study-pagerSelectWrapper', [
        h('div.categories',
          h('select.study-pagerSelect', {
            value: ctrl.cat,
            onchange: ctrl.onCatChange,
          }, categories.map(c =>
            h('option', {
              key: c[0],
              value: c[0],
            }, c[1])
          ))
        ),
        h('div.orders',
          h('select.study-pagerSelect', {
            value: ctrl.order,
            onchange: ctrl.onOrderChange,
          }, orders.map(o =>
            h('option', {
              key: o[0],
              value: o[0],
            }, o[1])
          ))
        ),
      ]),
      h('div.main_header_drop_shadow')
    ]),
    studyList(ctrl)
  ])
}

const categories: ReadonlyArray<[PagerCategory, string]> = [
  ['all', 'All studies'],
  ['mine', 'My studies'],
  ['member', 'Studies I contribue to'],
  ['public', 'My public studies'],
  ['private', 'My private studies'],
  ['likes', 'Favourite studies'],
]

const orders: ReadonlyArray<[PagerOrder, string]> = [
  ['hot', 'Hot'],
  ['newest', 'Date added (newest)'],
  ['updated', 'Recently updated'],
  ['popular', 'Most popular'],
]

function studyList(ctrl: StudyListCtrl) {
  const studies = ctrl.state ? ctrl.state.studies : []

  return h('div#scroller-wrapper.native_scroller.study-pagerScroller', {
    onscroll: throttle(ctrl.onScroll, 30),
    oncreate: helper.ontapY(e => onTap(ctrl, e!), undefined, helper.getLI)
  }, studies.length ?
    h('ul', {
      oncreate: ctrl.afterLoad,
    }, [...studies.map((study, index) =>
      h(Item, { study, index })
    ), ctrl.state.isLoading ? h('li.study-pagerItem', 'loading...') : []]) :
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
    const ownerName = study.owner ? playerApi.lightPlayerName(study.owner) : '?'

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
            h('span', ` ${study.likes} • ${ownerName} • ${study.date}`)
          ])
        ])
      ]),
      h('div.study-pagerItemBody', [
        h('ul.chapters', study.chapters.map(c =>
          h('li', [h('span.fa.fa-circle-o'), c])
        )),
        h('ul.members', study.members.filter(m => m.user !== null).map(m =>
          h('li.withIcon', {
            'data-icon': m.role === 'w' ? '' : 'v'
          }, playerApi.lightPlayerName(m.user!))
        )),
      ])
    ])
  }
} as Mithril.Component<{
  study: PagerDataWithDate
  index: number
}, {}>

