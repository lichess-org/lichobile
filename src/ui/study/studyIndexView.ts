import h from 'mithril/hyperscript'
import throttle from 'lodash-es/throttle'
import debounce from 'lodash-es/debounce'
import redraw from '../../utils/redraw'
import i18n from '../../i18n'
import spinner from '../../spinner'
import * as playerApi from '../../lichess/player'
import { PagerCategory, PagerOrder } from '../../lichess/interfaces/study'
import * as helper from '../helper'
import { closeIcon } from '../shared/icons'

import StudyIndexCtrl, { PagerDataWithDate } from './StudyIndexCtrl'

export default function studyIndexView(ctrl: StudyIndexCtrl) {
  return h('div.study-pagerWrapper', [
    h('div.study-pagerSubHeader.subHeader', [
      ctrl.state.showSearch ?
        h('form.study-pagerSearchWrapper', {
          onsubmit: ctrl.onSearch
        }, [
          h('div.inputWrapper', [
            h('input#studySearch[type=search]', {
              placeholder: 'Search studies',
              autocapitalize: 'off',
              autocomplete: 'off',
              oncreate: helper.autofocus,
              value: ctrl.q,
              oninput: debounce((e: Event) => {
                const val = (e.target as HTMLInputElement).value.trim()
                ctrl.canCancelSearch(val.length > 0)
                redraw()
              }, 200, { leading: true, trailing: true })
            }),
            ctrl.state.canCancelSearch ? h('div.cancel', {
              oncreate: helper.ontap(ctrl.cancelSearch)
            }, closeIcon) : null,
          ]),
          h('button', i18n('search')),
        ]) :
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
      h('div.study-pagerToggleSearch.fa.fa-search', {
        oncreate: helper.ontap(ctrl.toggleSearch)
      }),
    ]),
    studyList(ctrl)
  ])
}

const categories: ReadonlyArray<[PagerCategory, string]> = [
  ['all', i18n('allStudies')],
  ['mine', i18n('myStudies')],
  ['member', i18n('studiesIContributeTo')],
  ['public', i18n('myPublicStudies')],
  ['private', i18n('myPrivateStudies')],
  ['likes', i18n('myFavoriteStudies')],
]

const orders: ReadonlyArray<[PagerOrder, string]> = [
  ['hot', i18n('hot')],
  ['newest', i18n('dateAddedNewest')],
  ['updated', i18n('recentlyUpdated')],
  ['popular', i18n('mostPopular')],
]

function studyList(ctrl: StudyIndexCtrl) {
  const studies = ctrl.state ? ctrl.state.studies : []

  return h('div#scroller-wrapper.native_scroller.study-pagerScroller.box', {
    onscroll: throttle(ctrl.onScroll, 30),
    oncreate: helper.ontapY(e => onTap(ctrl, e!), undefined, helper.closestHandler('.study-pagerItem'))
  },
    ctrl.state.paginator ?
      studies.length ?
        h('ul', {
          oncreate: ctrl.afterLoad,
        }, [...studies.map((study, index) =>
          h(Item, { study, index })
        ), ctrl.state.isLoading ? h('li.list_item.study-pagerItem', 'loading...') : []]) :
          h('div.study-pagerEmpty', 'None yet') :
    h('div.study-pagerLoader', spinner.getVdom('monochrome'))
  )
}

function onTap(ctrl: StudyIndexCtrl, e: Event) {
  const el = helper.closest(e, '.study-pagerItem')
  const id = el?.dataset.id
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

    return h('li.list_item.study-pagerItem', {
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
}>
