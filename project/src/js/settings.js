import store from './storage';
import range from 'lodash/utility/range';

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

export default {
  general: {
    lang: localstorageprop('settings.lang'),
    sound: localstorageprop('settings.sound', true),
    theme: {
      background: localstorageprop('settings.bgTheme', 'dark'),
      availableBoardThemes: [
        ['boardThemeBrown', 'brown'],
        ['boardThemeBlue', 'blue'],
        ['boardThemeGreen', 'green'],
        ['boardThemeGrey', 'grey'],
        ['boardThemePurple', 'purple'],
        ['boardThemeWood', 'wood'],
        ['boardThemeWood2', 'wood2'],
        ['boardThemeWood3', 'wood3'],
        ['boardThemeMaple', 'maple'],
        ['boardThemeBlue2', 'blue3'],
        ['boardThemeCanvas', 'canvas'],
        ['boardThemeMetal', 'metal']
      ],
      availablePieceThemes: [
        'cburnett',
        'merida',
        'pirouetti',
        'alpha',
        'spatial',
        'reilly',
        'fantasy',
        'shapes',
        'chessnut',
        'chess7',
        'symmetric'
      ],
      board: localstorageprop('settings.theme.board', 'brown'),
      piece: localstorageprop('settings.theme.piece', 'cburnett')
    },
    analytics: localstorageprop('settings.analytics', true),
    notifications: localstorageprop('settings.notifications', true)
  },

  game: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde'
    ],
    animations: localstorageprop('settings.gameAnimations', true),
    pieceDestinations: localstorageprop('settings.pieceDestinations', true),
    coords: localstorageprop('settings.coords', true),
    moveConfirmation: localstorageprop('settings.game.moveConfirmation', 'correspondence')
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
    color: localstorageprop('settings.ai.color', 'white'),
    opponent: localstorageprop('settings.ai.opponent', '1')
  },

  gameSetup: {
    selected: localstorageprop('settings.game.selected', 'human'),
    availableTimes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15',
      '20', '25', '30', '40', '60', '90', '120', '150', '180'
    ],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '40', '60', '90', '120', '150', '180'
    ],
    availableDays: ['1', '2', '3', '5', '7', '10', '14'],
    isTimeValid: function(gameSettings) {
      return gameSettings.timeMode() !== '1' ||
        gameSettings.time() !== '0' ||
        gameSettings.increment() !== '0';
    },

    ai: {
      color: localstorageprop('settings.game.ai.color', 'random'),
      availableVariants: [
        ['Standard', '1'],
        ['Chess960', '2'],
        ['King of the Hill', '4'],
        ['From Position', '3']
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
        ['King of the Hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7'],
        ['Horde', '8']
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
      mode: localstorageprop('settings.game.human.mode', '0'),
      membersOnly: localstorageprop('settings.game.human.membersOnly', false)
    },

    challenge: {
      availableVariants: [
        ['Standard', '1'],
        ['Chess960', '2'],
        ['King of the Hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7'],
        ['Horde', '8'],
        ['From Position', '3']
      ],
      color: localstorageprop('settings.game.invite.color', 'random'),
      variant: localstorageprop('settings.game.invite.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: localstorageprop('settings.game.invite.clock', '1'),
      time: localstorageprop('settings.game.invite.time', '5'),
      increment: localstorageprop('settings.game.invite.increment', '0'),
      days: localstorageprop('settings.game.invite.days', '2'),
      mode: localstorageprop('settings.game.invite.mode', '0')
    }
  },

  tv: {
    channel: localstorageprop('settings.tv.channel', 'best')
  }
};
