import helper from '../helper';

export default {
  view(vnode) {

    const {
      buttons,
      selectedTab,
      onTabChange
    } = vnode.attrs;

    const iWidth = 100 / buttons.length;
    const index = buttons.findIndex(e => e.key === selectedTab);
    const shift = index * (iWidth * buttons.length);

    const indicatorStyle = {
      width: iWidth + '%',
      transform: `translateX(${shift}%)`
    };

    const buttonStyle = {
      width: iWidth + '%'
    };

    function renderTab(b) {
      const className = [
        'tab',
        selectedTab === b.key ? 'selected' : ''
      ].join(' ');
      const oncreate = helper.ontouch(onTabChange.bind(undefined, b.key));
      return (
        <button className={className} oncreate={oncreate} style={buttonStyle}>
          {b.label}
        </button>
      );
    }

    return (
      <div className="tabs">
        { buttons.map(renderTab) }
        <div className="tabIndicator" style={indicatorStyle} />
      </div>
    );
  }
};

