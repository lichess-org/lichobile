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

export default {
  view(vnode) {

    const {
      buttons,
      selectedIndex,
      onTabChange,
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
      const oncreate = helper.ontap(() => onTabChange(i))
      return (
        <button className={className} oncreate={oncreate} style={buttonStyle}>
          {b.label}
        </button>
      )
    }

    return (
      <div className="tabs-navigation">
        { buttons.map(renderTab) }
        { noIndicator ? null :
          <div className="tabIndicator" style={indicatorStyle} />
        }
      </div>
    )
  }
} as Mithril.Component<Attrs, {}>
