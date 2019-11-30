import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import Gesture from '../../utils/Gesture'
import { hashCode } from '../../utils'
import { viewportDim, findParentBySelector, headerHeight, isPortrait, isTablet } from '../helper'

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
}

export default {
  oninit({ attrs }) {
    this.nbTabs = attrs.contentRenderers.length
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

  onupdate({ attrs }) {
    this.nbTabs = attrs.contentRenderers.length
  },

  onremove() {
    this.gesture.destroy()
  },

  view({ attrs }) {
    const {
      contentRenderers,
      selectedIndex,
      boardView = false,
      withWrapper = false
    } = attrs
    const vd = viewportDim()
    const curIndex = selectedIndex
    const tabWidth = isPortrait() || !boardView ?
      vd.vw :
        isTablet() ?
          vd.vw - (vd.vh * 0.94) + headerHeight - (vd.vh * 0.09) :
          vd.vw - vd.vh + headerHeight

    const width = contentRenderers.length * tabWidth
    const shift = -(curIndex * tabWidth)

    const style = {
      width: `${width}px`,
      transform: `translateX(${shift}px)`
    }

    const view = h('div.tabs-view', {
      style,
      className: attrs.className
    }, contentRenderers.map((f: () => Mithril.Children, index: number) =>
      h('div.tab-content', {
        style: {
          width: `${tabWidth}px`,
        },
        key: hashCode(f.toString()),
        'data-index': index,
        className: selectedIndex === index ? 'current' : '',
      },  selectedIndex === index ? f() : null)
    ))

    return withWrapper ? h('div.tabs-view-wrapper', view) : view
  }
} as Mithril.Component<Attrs, State>
