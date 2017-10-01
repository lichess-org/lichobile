import * as helper from '../helper'

interface TabButton {
  label?: string
  title?: string
  className?: string
}

interface Attrs {
  buttons: Array<TabButton>
  selectedIndex: number
  onTabChange: (i: number) => void
  noIndicator?: boolean
}

interface State {
  onTap: (e: TouchEvent) => void
}

interface TabDataSet extends DOMStringMap {
  index: string
}

export default {
  oninit({ attrs }) {
    this.onTap = (e: TouchEvent) => {
      const el = helper.getButton(e)
      let i
      if (el && (i = (el.dataset as TabDataSet).index)) {
        attrs.onTabChange(Number(i))
      }
    }
  },

  view(vnode) {

    const {
      buttons,
      selectedIndex,
      noIndicator
    } = vnode.attrs

    const iWidth = 100 / buttons.length
    const shift = selectedIndex * (iWidth * buttons.length)

    const indicatorStyle = {
      width: iWidth + '%',
      transform: `translateX(${shift}%)`
    }

    const buttonStyle = {
      width: iWidth + '%'
    }

    function renderTab(b: TabButton, i: number) {
      const className = [
        'tab-button',
        selectedIndex === i ? 'selected' : '',
        b.className
      ].join(' ')
      return (
        <button data-index={i} className={className} style={buttonStyle}>
          {b.label}
        </button>
      )
    }

    return (
      <div className="tabs-navigation"
        oncreate={helper.ontap(this.onTap)}
      >
        { buttons.map(renderTab) }
        { noIndicator ? null :
          <div className="tabIndicator" style={indicatorStyle} />
        }
      </div>
    )
  }
} as Mithril.Component<Attrs, State>
