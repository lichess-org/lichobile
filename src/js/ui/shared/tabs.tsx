import * as helper from '../helper'

interface TabButton {
  key: string
  label: string
}

interface Attrs {
  buttons: Array<TabButton>
  selectedTab: string
  onTabChange: (k: string) => void
}

const Tabs: Mithril.Component<Attrs, {}> = {
  view(vnode) {

    const {
      buttons,
      selectedTab,
      onTabChange
    } = vnode.attrs

    const iWidth = 100 / buttons.length
    const index = buttons.findIndex(e => e.key === selectedTab)
    const shift = index * (iWidth * buttons.length)

    const indicatorStyle = {
      width: iWidth + '%',
      transform: `translateX(${shift}%)`
    }

    const buttonStyle = {
      width: iWidth + '%'
    }

    function renderTab(b: TabButton) {
      const className = [
        'tab',
        selectedTab === b.key ? 'selected' : ''
      ].join(' ')
      const oncreate = helper.ontap(() => onTabChange(b.key))
      return (
        <button className={className} oncreate={oncreate} style={buttonStyle}>
          {b.label}
        </button>
      )
    }

    return (
      <div className="tabs">
        { buttons.map(renderTab) }
        <div className="tabIndicator" style={indicatorStyle} />
      </div>
    )
  }
}

export default Tabs
