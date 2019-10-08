import * as Mithril from 'mithril'
import * as helper from '../helper'
import socket from '../../socket'
import * as sleepUtils from '../../utils/sleep'
import Editor from './Editor'
import editorView from './editorView'

interface Attrs {
  fen?: string
}

interface State {
  editor: Editor
}

const EditorScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    socket.createDefault()

    sleepUtils.keepAwake()

    this.editor = new Editor(attrs.fen)
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    sleepUtils.allowSleepAgain()
  },
  view() {
    return editorView(this.editor)
  }
}

export default EditorScreen
