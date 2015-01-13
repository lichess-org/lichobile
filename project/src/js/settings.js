var store = require('./storage');

function localstorageprop(key, initialValue) {
  return function() {
    if (arguments.length) store.set(key, arguments[0]);
    var ret = store.get(key);
    return (ret !== null) ? ret : initialValue;
  };
}

module.exports = {
  general: {
    animations: localstorageprop('settings.gameAnimations', true),
    sound: localstorageprop('settings.sound', true)
  },
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
