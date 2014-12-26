var store = require('./storage');

function localstorageprop(key, initialValue) {
  function getset() {
    if (arguments.length) store.set(key, arguments[0]);
    var ret = store.get(key);
    if (ret !== null) return ret;
    else return initialValue;
  }

  return getset;
}

var settings = {
  general: [
    { label: "Disable sleep", active: localstorageprop('settings.disableSleep') },
    { label: "Show last move", active: localstorageprop('settings.showLastMove') },
    { label: "Show possible destinations", active: localstorageprop('settings.showDests') },
    { label: "Show coordinates", active: localstorageprop('settings.showCoords') },
    { label: "Threefold auto draw", active: localstorageprop('settings.threeFoldAutoDraw') },
    { label: "Sound", active: localstorageprop('settings.sound') }
  ],
  newGame: {
    selected: localstorageprop('settings.game.selected', 'human'),
    ai: {
      color: localstorageprop('settings.game.ai.color', 'random'),
      variant: localstorageprop('settings.game.ai.variant', '1'),
      timeMode: localstorageprop('settings.game.ai.clock', '1'),
      time: localstorageprop('settings.game.ai.time', '10'),
      increment: localstorageprop('settings.game.ai.increment', '0'),
      days: localstorageprop('settings.game.ai.days', '2'),
      level: localstorageprop('settings.game.ai.aiLevel', '3')
    },
    human: {
      color: localstorageprop('settings.game.human.color', 'random'),
      variant: localstorageprop('settings.game.human.variant', '1'),
      timeMode: localstorageprop('settings.game.human.clock', '1'),
      timePreset: localstorageprop('settings.game.human.timePreset', '5+0'),
      days: localstorageprop('settings.game.human.days', '2'),
      mode: localstorageprop('settings.game.human.mode', '0')
    }
  }
};

module.exports = settings;
