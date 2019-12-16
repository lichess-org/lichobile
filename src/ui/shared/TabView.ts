import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import Gesture from '../../utils/Gesture'
import { viewportDim, findParentBySelector, elSlideIn } from '../helper'

interface Attrs {
  selectedIndex: number
  contentRenderers: ReadonlyArray<() => Mithril.Children>
  onTabChange: (i: number) => void
  className?: string
  boardView?: boolean
  withWrapper?: boolean
}

interface State {
  nbTabs: number
  gesture: Gesture
  prevIndex: number
}

export default {
  oninit({ attrs }) {
    this.nbTabs = attrs.contentRenderers.length
    this.prevIndex = attrs.selectedIndex
  },

  oncreate({ attrs, dom }) {
    this.gesture = new Gesture(dom as HTMLElement, viewportDim())

    this.gesture.on('swiperight', (e: TouchEvent) => {
      const tab = findParentBySelector(e.target as HTMLElement, '.tab-content')
      if (tab) {
        const ds = tab.dataset as DOMStringMap
        const index = Number(ds.index)
        if (index !== undefined && index > 0) {
          attrs.onTabChange(index - 1)
        }
      }
    })

    this.gesture.on('swipeleft', (e: TouchEvent) => {
      const tab = findParentBySelector(e.target as HTMLElement, '.tab-content')
      if (tab) {
        const ds = tab.dataset as DOMStringMap
        const index = Number(ds.index)
        if (index !== undefined) {
          if (index < this.nbTabs - 1) {
            attrs.onTabChange(index + 1)
          }
        }
      }
    })
  },

  onupdate({ attrs, dom }) {
    this.nbTabs = attrs.contentRenderers.length

    if (attrs.selectedIndex > this.prevIndex) {
      elSlideIn(dom as HTMLElement, 'left')
    } else if (attrs.selectedIndex < this.prevIndex) {
      elSlideIn(dom as HTMLElement, 'right')
    }

    this.prevIndex = attrs.selectedIndex
  },

  onremove() {
    this.gesture.destroy()
  },

  view({ attrs }) {
    const {
      contentRenderers,
      selectedIndex,
      withWrapper = false
    } = attrs
    const renderer = contentRenderers[selectedIndex]

    const view = h('div.tab-content.box', {
      'data-index': selectedIndex,
      className: attrs.className
    },  renderer())

    return withWrapper ? h('div.tabs-view-wrapper', view) : view
  }
} as Mithril.Component<Attrs, State>
