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
    pieceDestinations: localstorageprop('settings.pieceDestinations', true),
    sound: localstorageprop('settings.sound', true)
  },
  onChange: function(prop, callback) {
    if (!callback) return prop;
    return function() {
      if (arguments.length) {
        var res = prop(arguments[0]);
        if (callback) callback(res);
        return res;
      }
      return prop();
    };
  },
  game: {
    selected: localstorageprop('settings.game.selected', 'human'),
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic'
    ],
    availableTimes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15',
    '20', '25', '30', '40', '60', '90', '120', '150', '180'],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '10', '15', '20', '25', '30', '40', '60', '90', '120', '150', '180'],
    ai: {
      color: localstorageprop('settings.game.ai.color', 'random'),
      availableVariants: [
        ['Standard', '1'],
        ['Chess960', '2'],
        ['King of the hill', '4']
      ],
      variant: localstorageprop('settings.game.ai.variant', '1'),
      availableTimeModes: [
        ['unlimited', '0'],
        ['realTime', '1']
      ],
      timeMode: localstorageprop('settings.game.ai.clock', '1'),
      time: localstorageprop('settings.game.ai.time', '10'),
      increment: localstorageprop('settings.game.ai.increment', '0'),
      days: localstorageprop('settings.game.ai.days', '2'),
      level: localstorageprop('settings.game.ai.aiLevel', '3')
    },
    human: {
      color: localstorageprop('settings.game.human.color', 'random'),
      availableVariants: [
        ['Standard', '1'],
        ['Chess960', '2'],
        ['King of the hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7']
      ],
      variant: localstorageprop('settings.game.human.variant', '1'),
      availableTimeModes: [
        ['realTime', '1']
      ],
      timeMode: localstorageprop('settings.game.human.clock', '1'),
      time: localstorageprop('settings.game.human.time', '5'),
      increment: localstorageprop('settings.game.human.increment', '0'),
      days: localstorageprop('settings.game.human.days', '2'),
      mode: localstorageprop('settings.game.human.mode', '0')
    }
  }
};
