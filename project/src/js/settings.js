import store from './storage';
import range from 'lodash/range';

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
    vibrateOnGameEvents: localstorageprop('settings.vibrateOnGameEvents', false),
    notifications: {
      allow: localstorageprop('settings.notifications', true),
      vibrate: localstorageprop('settings.notifications.vibrate', true),
      sound: localstorageprop('settings.notifications.sound', true)
    }
  },

  game: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    animations: localstorageprop('settings.gameAnimations', true),
    highlights: localstorageprop('settings.boardHighlights', true),
    pieceDestinations: localstorageprop('settings.pieceDestinations', true),
    coords: localstorageprop('settings.coords', true),
    magnified: localstorageprop('settings.pieceMagnified', true)
  },

  analyse: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    enableCeval: localstorageprop('settings.analyse.enableCeval', false),
    showBestMove: localstorageprop('settings.analyse.showBestMove', true)
  },

  ai: {
    availableOpponents: [
      ['Stockfish', '1'],
      ['Stockfish', '2'],
      ['Stockfish', '3'],
      ['Stockfish', '4'],
      ['Stockfish', '5'],
      ['Stockfish', '6'],
      ['Stockfish', '7'],
      ['Stockfish', '8']
    ],
    color: localstorageprop('settings.ai.color', 'white'),
    opponent: localstorageprop('settings.ai.opponent', '1'),
    variant: localstorageprop('settings.ai.variant', 'standard'),
    availableVariants: [
      ['Standard', 'standard'],
      ['Chess960', 'chess960'],
      ['King of the Hill', 'kingOfTheHill'],
      ['Three-check', 'threeCheck']
    ]
  },

  otb: {
    flipPieces: localstorageprop('settings.otb.flipPieces', false),
    useSymmetric: localstorageprop('settings.otb.useSymmetric', true),
    variant: localstorageprop('settings.otb.variant', 'standard'),
    availableVariants: [
      ['Standard', 'standard'],
      ['Crazyhouse', 'crazyhouse'],
      ['Chess960', 'chess960'],
      ['King of the Hill', 'kingOfTheHill'],
      ['Three-check', 'threeCheck'],
      ['Antichess', 'antichess'],
      ['Atomic', 'atomic'],
      ['Horde', 'horde'],
      ['Racing Kings', 'racingKings']
    ]
  },

  clock: {
    availableClocks: [
      ['Sudden Death', 'simple'],
      ['Increment', 'increment'],
      ['Simple Delay', 'delay'],
      ['Bronstein Delay', 'bronstein'],
      ['Hourglass', 'hourglass'],
      ['Stage', 'stage']
    ],

    clockType: localstorageprop('settings.clock.clockType', 'simple'),

    simple: {
      time: localstorageprop('settings.clock.simple.time', '5')
    },

    increment: {
      time: localstorageprop('settings.clock.increment.time', '3'),
      increment: localstorageprop('settings.clock.increment.increment', '2')
    },

    delay: {
      time: localstorageprop('settings.clock.delay.time', '3'),
      increment: localstorageprop('settings.clock.delay.increment', '2')
    },

    bronstein: {
      time: localstorageprop('settings.clock.bronstein.time', '3'),
      increment: localstorageprop('settings.clock.bronstein.increment', '2')
    },

    hourglass: {
      time: localstorageprop('settings.clock.hourglass.time', '5')
    },

    stage: {
      stages: localstorageprop('settings.clock.stage.stages', [{time: '120', moves: '40'}, {time: '60', moves: null}]),
      increment: localstorageprop('settings.clock.stage.increment', '30')
    },

    availableTimes: [['0', '0'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90'], ['120', '120'], ['150', '150'], ['180', '180']
    ],

    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '45', '60', '90', '120', '150', '180'
    ],

    availableMoves: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'
    ]
  },

  gameSetup: {
    selected: localstorageprop('settings.game.selected', 'human'),
    availableTimes: [['0', '0'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90'], ['120', '120'], ['150', '150'], ['180', '180']
    ],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '45', '60', '90', '120', '150', '180'
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
        ['Three-check', '5'],
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
        ['Crazyhouse', '10'],
        ['Chess960', '2'],
        ['King of the Hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7'],
        ['Horde', '8'],
        ['Racing Kings', '9']
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
      membersOnly: localstorageprop('settings.game.human.membersOnly', false),
      color: localstorageprop('settings.game.human.color', 'random')
    },

    challenge: {
      availableVariants: [
        ['Standard', '1'],
        ['Crazyhouse', '10'],
        ['Chess960', '2'],
        ['King of the Hill', '4'],
        ['Three-check', '5'],
        ['Antichess', '6'],
        ['Atomic', '7'],
        ['Horde', '8'],
        ['Racing Kings', '9'],
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
