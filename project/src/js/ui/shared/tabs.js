import helper from '../helper';

export default {
  view(_, args) {

    const {
      buttons,
      selectedTab,
      onTabChange
    } = args;

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
      const config = helper.ontouch(onTabChange.bind(undefined, b.key));
      return (
        <button className={className} config={config} style={buttonStyle}>
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

