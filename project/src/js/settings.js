var store = require('./storage');
var range = require('lodash-node/modern/arrays/range');

function localstorageprop(key, initialValue) {
  return function() {
    if (arguments.length) store.set(key, arguments[0]);
    var ret = store.get(key);
    return (ret !== null) ? ret : initialValue;
  };
}

function tupleOf(x) {
  return [x.toString(), x.toString()];
}

module.exports = {
  general: {
    animations: localstorageprop('settings.gameAnimations', true),
    pieceDestinations: localstorageprop('settings.pieceDestinations', true),
    sound: localstorageprop('settings.sound', true),
    theme: {
      availableBoardThemes: [
        ['Brown', 'brown'],
        ['Blue', 'blue'],
        ['Green', 'green'],
        ['Grey', 'grey'],
        ['Purple', 'purple'],
        ['Wood', 'wood'],
        ['Wood 2', 'wood3'],
        ['Blue 2', 'blue3'],
        ['Canvas', 'canvas']
      ],
      availablePieceThemes: [
        'cburnett',
        'merida',
        'pirouetti',
        'alpha',
        'spatial',
        'lightp'
      ],
      board: localstorageprop('settings.theme.board', 'grey'),
      piece: localstorageprop('settings.theme.piece', 'merida')
    }
  },
  otb: {
    flipPieces: localstorageprop('settings.otb.flipPieces', false)
  },
  ai: {
    availableOpponents: [
      ['Tuco Salamanca', '1'],
      ['Jesse Pinkman', '2'],
      ['Skyler White', '3'],
      ['Saul Goodman', '4'],
      ['Mike Ehrmantraut', '5'],
      ['Lydia Rodarte-Quayle', '6'],
      ['Gustavo Fring', '7'],
      ['Heisenberg', '8']
    ],
    opponent: localstorageprop('settings.ai.opponent', '1')
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
      '20', '25', '30', '40', '60', '90', '120', '150', '180'
    ],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '40', '60', '90', '120', '150', '180'
    ],
    availableDays: ['1', '2', '3', '5', '7', '10', '14'],
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
      availableVariants: [
        ['Standard', '1'],
        ['Chess960', '2'],
        ['King of the hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7']
      ],
      availableRatingRanges: {
        min: range(800, 2900, 100).map(tupleOf),
        max: range(900, 3000, 100).map(tupleOf)
      },
      ratingMin: localstorageprop('settings.game.human.rating.min', '800'),
      ratingMax: localstorageprop('settings.game.human.rating.max', '2900'),
      variant: localstorageprop('settings.game.human.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: localstorageprop('settings.game.human.clock', '1'),
      time: localstorageprop('settings.game.human.time', '5'),
      increment: localstorageprop('settings.game.human.increment', '0'),
      days: localstorageprop('settings.game.human.days', '2'),
      mode: localstorageprop('settings.game.human.mode', '0')
    }
  }
};
