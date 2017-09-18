import * as helper from '../../helper'
import oninit from './threadCtrl'
import view from './threadView'
import { ThreadAttrs, ThreadState } from '../interfaces'

const ThreadScreen: Mithril.Component<ThreadAttrs, ThreadState> = {
  oncreate: helper.viewFadeIn,
  oninit,
  onremove() {
    window.removeEventListener('native.keyboardshow', this.onKeyboardShow)
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide)
  },
  view
}

export default ThreadScreen
