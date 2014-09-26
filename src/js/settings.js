'use strict';

var m = require('mithril');
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

function view(ctrl) {
  return m('ul', [
    ctrl.settings.map(function(setting, index) {
      return m('li', [
        m('span', setting.label),
        m('label', { 'for': "setting-" + index }),
        m('input[type=checkbox]', { checked: setting.active(), onchange: m.withAttr('checked', setting.active) })
      ])
    })
  ]);
}

module.exports = {
  controller: controller,
  view: view
};
