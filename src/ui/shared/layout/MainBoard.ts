import h from 'mithril/hyperscript'

import Gesture from '../../../utils/Gesture'
import { viewportDim } from '../../helper'
import * as menu from '../../menu'
import EdgeOpenHandler, { Handlers } from '../sideMenu/EdgeOpenHandler'

interface Attrs {
  header: Mithril.Children
  color?: string
  handlers?: Handlers
  klass?: string
}

interface State {
  gesture: Gesture
  boundHandlers: boolean
}

export default {
  oninit() {
    this.boundHandlers = false
  },

  oncreate({ dom }) {
    this.gesture = new Gesture(dom as HTMLElement, viewportDim())
    const defaultHandlers: Handlers = EdgeOpenHandler(menu.mainMenuCtrl)
    for (const eventName in defaultHandlers) {
      this.gesture.on(eventName, defaultHandlers[eventName](this.gesture))
    }
  },

  onupdate({ attrs }) {
    if (!this.boundHandlers && attrs.handlers) {
      this.boundHandlers = true
      for (const eventName in attrs.handlers) {
        this.gesture.on(eventName, attrs.handlers[eventName](this.gesture))
      }
    }
  },

  view({ attrs, children }) {
    const { header, color } = attrs
    return h('main#page', {
      className: color,
    }, [
      h('header.main_header.board', header),
      h('div.content_round', {
        className: attrs.klass || ''
      }, children),
      h('div#menu-close-overlay.menu-backdrop', { oncreate: menu.backdropCloseHandler })
    ])
  }
} as Mithril.Component<Attrs, State>
