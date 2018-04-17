import * as h from 'mithril/hyperscript'
import { Study } from '../../../../lichess/interfaces/study'
import { header, backButton } from '../../../shared/common'
import layout from '../../../layout'

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
    h('div.main_header_title.withSub', [
      h('h1.header-gameTitle', title),
      h('h2.header-subTitle', subTitle)
    ])
  ))
}
