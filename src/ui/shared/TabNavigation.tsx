import * as helper from '../helper'

interface TabButton {
  readonly label?: string
  readonly title?: string
  readonly className?: string
  readonly chip?: number | string
}

interface Attrs {
  readonly buttons: ReadonlyArray<TabButton>
  readonly selectedIndex: number
  readonly onTabChange: (i: number) => void
  readonly noIndicator?: boolean
  readonly wrapperClass?: string
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
      noIndicator,
      wrapperClass,
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
          {b.chip !== undefined ?
            <span className="chip">{b.chip}</span> : null
          }
        </button>
      )
    }

    return (
      <div className={'tabs-navigation' + (wrapperClass ? ' ' + wrapperClass : '')}
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
