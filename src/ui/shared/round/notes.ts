import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import debounce from 'lodash-es/debounce'
import redraw from '../../../utils/redraw'
import spinner from '../../../spinner'
import i18n from '../../../i18n'
import router from '../../../router'
import * as helper from '../../helper'
import { closeIcon } from '../../shared/icons'
import { GameData } from '../../../lichess/interfaces/game'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import { readNote, syncNote } from './roundXhr'

export class NotesCtrl {
  public syncing: boolean
  public showing: boolean
  public inputValue: string
  public data: GameData | AnalyseData

  constructor(data: GameData | AnalyseData) {

    this.syncing = true
    this.data = data
    this.showing = false
    this.inputValue = ''

    readNote(data.game.id)
    .then(note => {
      this.data.note = note
      this.syncing = false
      redraw()
    })
    .catch(() => {
      this.syncing = false
      redraw()
      Plugins.LiToast.show({ text: 'Could not read notes from server.', duration: 'short' })
    })

  }

  public syncNotes = debounce((e: Event) => {
    const text = (e.target as HTMLInputElement).value
    if (this.data.note !== text) {
      syncNote(this.data.game.id, text)
      .then(() => {
        this.data.note = text
        redraw()
      })
    }
  }, 1000)

  public open = () => {
    router.backbutton.stack.push(helper.slidesOutDown(this.close, 'notes'))
    this.showing = true
  }

  public close = (fromBB?: string) => {
    Plugins.Keyboard.hide()
    if (fromBB !== 'backbutton' && this.showing) {
      router.backbutton.stack.pop()
    }
    this.showing = false
  }
}

export function notesView(ctrl: NotesCtrl) {

  if (!ctrl.showing) return null

  return h('div#notes.modal', { oncreate: helper.slidesInUp }, [
    h('header', [
      h('button.modal_close', {
        oncreate: helper.ontap(helper.slidesOutDown(ctrl.close, 'notes'))
      }, closeIcon),
      h('h2', i18n('notes'))
    ]),
    h('div.modal_content', [
      ctrl.syncing ?
      h('div.notesTextarea.loading', spinner.getVdom()) :
      h('textarea#notesTextarea.native_scroller', {
        placeholder: i18n('typePrivateNotesHere'),
        oninput: ctrl.syncNotes,
        value: ctrl.data.note,
      })
    ])
  ])
}
