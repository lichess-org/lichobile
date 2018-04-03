import * as h from 'mithril/hyperscript'
import router from '../../../router'
import * as helper from '../../helper'
import CloseSlideHandler from '../../shared/sideMenu/CloseSlideHandler'
import CloseSwipeHandler from '../../shared/sideMenu/CloseSwipeHandler'

import StudyCtrl from '../../analyse/study/StudyCtrl'

export interface Attrs {
  studyCtrl: StudyCtrl
}

interface DataSet extends DOMStringMap {
  id: string
}

export default {
  onbeforeupdate({ attrs }) {
    const sm = attrs.studyCtrl.sideMenu
    return sm.isOpen || sm.isSliding
  },
  view({ attrs }) {
    const { studyCtrl } = attrs
    const study = studyCtrl.data
    const membersIds = Object.keys(study.members)
    return h('aside#studyMenu', {
      oncreate: ({ dom }: Mithril.DOMNode) => {
        if (window.cordova.platformId === 'ios') {
          CloseSwipeHandler(dom as HTMLElement, studyCtrl.sideMenu)
        } else {
          CloseSlideHandler(dom as HTMLElement, studyCtrl.sideMenu)
        }
      }
    }, [
      h('div.native_scroller', [
        h('h2.study-menu-title', `${membersIds.length} members`),
        h('ul', membersIds.map(id =>
          h('li.study-menu-link', [
            h('span.fa.fa-user.bullet'),
            h('span', study.members[id]!.user.name)
          ])
        )),
        h('h2.study-menu-title', `${study.chapters.length} chapters`),
        h('ol', {
          oncreate: helper.ontapXY(e => {
            const el = helper.getLI(e)
            const id = el && (el.dataset as DataSet).id
            if (id) {
              studyCtrl.sideMenu.close()
              .then(() => router.set(`/study/${study.id}/chapter/${id}`))
            }
          }, undefined, helper.getLI)
        }, study.chapters.map((c, i) => {
          return h('li.study-menu-link', {
            'data-id': c.id,
            className: study.chapter.id === c.id ? 'current' : ''
          }, [
            h('span.bullet', i + 1),
            h('span', c.name)
          ])
        }))
      ])
    ])
  }
} as Mithril.Component<Attrs, {}>
