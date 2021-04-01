import h from 'mithril/hyperscript'
import announce from '~/announce'
import settings from '~/settings'
import renderAnnouncement from '~/ui/announceView'

import Gesture from '../../../utils/Gesture'
import { classSet, viewportDim } from '../../helper'
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
    const classes = {
      righty: settings.game.landscapeBoardSide() === 'right'
    } as {[k: string]: boolean}
    if (attrs.klass) {
      classes[attrs.klass] = true
    }

    return h('main#page', {
      className: color,
    }, [
      h('header.main_header.board', header),
      renderAnnouncement(announce.get()),
      h('div.content_round', {
        className: classSet(classes),
      }, children),
      h('div#menu-close-overlay.menu-backdrop', { oncreate: menu.backdropCloseHandler })
    ])
  }
} as Mithril.Component<Attrs, State>
