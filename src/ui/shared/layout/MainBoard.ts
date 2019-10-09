import * as Mithril from 'mithril'
import Hammer from 'hammerjs'
import h from 'mithril/hyperscript'

import EdgeOpenHandler, { HammerHandlers } from '../sideMenu/EdgeOpenHandler'
import * as menu from '../../menu'

interface Attrs {
  header: Mithril.Children
  color?: string
  hammerHandlers?: HammerHandlers
}

interface State {
  mc: HammerManager
  boundHandlers: boolean
}

export default {
  oninit() {
    this.boundHandlers = false
  },

  oncreate({ dom }) {
    this.mc = new Hammer.Manager(dom as HTMLElement, {
      inputClass: Hammer.TouchInput
    })
    this.mc.add(new Hammer.Pan({
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 5
    }))
    const defaultHandlers: HammerHandlers = EdgeOpenHandler(menu.mainMenuCtrl)
    for (const eventName in defaultHandlers) {
      this.mc.on(eventName, defaultHandlers[eventName])
    }
  },

  onupdate({ attrs }) {
    if (!this.boundHandlers && attrs.hammerHandlers) {
      this.boundHandlers = true
      for (const eventName in attrs.hammerHandlers) {
        this.mc.on(eventName, attrs.hammerHandlers[eventName])
      }
    }
  },

  view({ attrs, children }) {
    const { header, color } = attrs
    return h('main#page', {
      className: color,
    }, [
      h('header.main_header.board', header),
      h('div.content_round', children),
      h('div#menu-close-overlay.menu-backdrop', { oncreate: menu.backdropCloseHandler })
    ])
  }
} as Mithril.Component<Attrs, State>
