import * as h from 'mithril/hyperscript'
import router from '../../../router'
import * as helper from '../../helper'

import StudyCtrl from '../../analyse/study/StudyCtrl'

export interface Attrs {
  studyCtrl: StudyCtrl
}

interface DataSet extends DOMStringMap {
  id: string
}

export default {
  view({ attrs }) {
    const { studyCtrl } = attrs
    const study = studyCtrl.data
    return h('aside#studyMenu', [
      h('div.native_scroller', [
        h('h2.study-chapters-title', `${study.chapters.length} chapters`),
        h('ul', {
          oncreate: helper.ontapXY(e => {
            const el = helper.getLI(e)
            const id = el && (el.dataset as DataSet).id
            if (id) {
              studyCtrl.sideMenu.close()
              .then(() => router.set(`/study/${study.id}/chapter/${id}`))
            }
          }, undefined, helper.getLI)
        }, study.chapters.map((c, i) => {
          return h('li.study-chapter-link', {
            'data-id': c.id,
            className: study.chapter.id === c.id ? 'current' : ''
          }, [
            h('span.chapNum', i + 1),
            h('span.chapName', c.name)
          ])
        }))
      ])
    ])
  }
} as Mithril.Component<Attrs, {}>
