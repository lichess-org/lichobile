import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import { Study } from '../../lichess/interfaces/study'
import { header, backButton } from '../shared/common'
import * as helper from '../helper'
import layout from '../layout'

export function notFound() {
  return layout.free(
    header(null, backButton('Not Found')),
    h('div')
  )
}

export function studyHeader(study: Study) {
  const title = study.name
  const subTitle = study.chapters.find(c => c.id === study.chapter.id)!.name
  return header(null, backButton(
    h('div.main_header_title.withSub', {
    }, [
      h('h1.header-gameTitle', {
        oncreate: helper.ontap(() => {
          Plugins.LiToast.show({ text: `${title}: ${subTitle}`, duration: 'long', position: 'top' })
        })
      }, title),
      h('h2.header-subTitle', subTitle)
    ])
  ))
}
