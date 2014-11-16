'use strict';

var store = require('./storage');

function localstorageprop(key) {
  function getset(value) {
    if (arguments.length > 0) store.set(key, new String(value));
    return store.get(key) !== "false";
  }

  getset.toJSON = function() { return store.get(key) === "false"; }

  return getset;
}

function controller() {
  this.settings = [
    { label: "Disable sleep", active: localstorageprop('settings.disableSleep') },
    { label: "Show last move", active: localstorageprop('settings.showLastMove') },
    { label: "Show possible destinations", active: localstorageprop('settings.showDests') },
    { label: "Show coordinates", active: localstorageprop('settings.showCoords') },
    { label: "Threefold auto draw", active: localstorageprop('settings.threeFoldAutoDraw') },
    { label: "Sound", active: localstorageprop('settings.sound') }
  ];
}

function topbar(block) {
  return m('div', [
    m('header', [
      m('ul', [
        m('li.title', 'Settings'),
        m('li.close', [
          m('a', { 'rel': 'close' }, 'Close')
        ])
      ])
    ]),
    block()
  ]);
}

function view(ctrl) {
  return topbar(function() {
    return m('ul.settings', [
      ctrl.settings.map(function(setting, index) {
        return m('li', [
          m('span', setting.label),
          m('input[type=checkbox]', { 'class': 'tgl tgl-flat', 'id': ('setting-' + index), checked: setting.active(), onchange: m.withAttr('checked', setting.active) }),
          m('label', { 'for': ('setting-' + index), 'class': 'tgl-btn' })
        ])
      })
    ]);
  });
}

module.exports = {
  controller: controller,
  view: view
};
