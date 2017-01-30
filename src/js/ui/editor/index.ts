import * as helper from '../helper'
import socket from '../../socket'
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

    helper.analyticsTrackView('Board Editor')

    this.editor = new Editor(attrs.fen)
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view() {
    return editorView(this.editor)
  }
}

export default EditorScreen
