import store from './storage'
import * as range from 'lodash/range'
import { ClockType, ClockTypeWithNone } from './ui/shared/clock/interfaces'

export interface SettingsProp<T> {
  (): T
  (value: T): T
}

function localstorageprop<T>(key: string, initialValue: T): SettingsProp<T> {
  return function() {
    if (arguments.length) store.set(key, arguments[0])
    const ret = store.get<T>(key)
    return (ret !== null && ret !== undefined) ? ret : initialValue
  }
}

function tupleOf(x: number) {
  return [x.toString(), x.toString()]
}

const offlineAvailableVariants: [string, VariantKey][] = [
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

export interface GameSettings {
  time: SettingsProp<string>
  timeMode: SettingsProp<string>
  increment: SettingsProp<string>
  color: SettingsProp<string>
  mode?: SettingsProp<string>
  variant: SettingsProp<string>
  ratingMin?: SettingsProp<string>
  ratingMax?: SettingsProp<string>
  days?: SettingsProp<string>
  level?: SettingsProp<string>
}

export interface HumanSettings extends GameSettings {
  mode: SettingsProp<string>
  ratingMin: SettingsProp<string>
  ratingMax: SettingsProp<string>
  days: SettingsProp<string>
}

export interface AiSettings extends GameSettings {
  level: SettingsProp<string>
}

export default {
  general: {
    lang: localstorageprop<string | null>('settings.lang', null),
    sound: localstorageprop('settings.sound', true),
    theme: {
      availableBackgroundThemes: [
        { key: 'dark', name: 'bgThemeDark', ext: '' },
        { key: 'light', name: 'bgThemeLight', ext: '' },
        { key: 'bgshapes', name: 'bgThemeShapes', ext: 'jpg' },
        { key: 'anthracite', name: 'bgThemeAnthracite', ext: 'jpg' },
        { key: 'blue-maze', name: 'bgThemeBlueMaze', ext: 'jpg' },
        { key: 'red-maze', name: 'bgThemeRedMaze', ext: 'jpg' },
        { key: 'checkerboard', name: 'bgThemeGreenCheckerboard', ext: 'png' },
        { key: 'wood', name: 'bgThemeWood', ext: 'jpg' },
        { key: 'space', name: 'bgThemeVioletSpace', ext: 'jpg' },
      ],
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
        'riohacha',
        'symmetric'
      ],
      board: localstorageprop('settings.theme.board', 'brown'),
      piece: localstorageprop('settings.theme.piece', 'cburnett')
    },
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
    magnified: localstorageprop('settings.pieceMagnified', true),
    pieceNotation: localstorageprop('settings.pieceNotation', true),
    zenMode: localstorageprop('settings.zenMode', false)
  },

  analyse: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    availableVariants: offlineAvailableVariants,
    syntheticVariant: localstorageprop<VariantKey>('settings.analyse.syntheticVariant', 'standard'),
    enableCeval: localstorageprop('settings.analyse.enableCeval', false),
    cevalMultiPvs: localstorageprop<number>('settings.ceval.multipv', 1),
    cevalCores: localstorageprop<number>('settings.ceval.cores', 1),
    cevalInfinite: localstorageprop<boolean>('settings.ceval.infinite', false),
    showBestMove: localstorageprop('settings.analyse.showBestMove', true),
    showComments: localstorageprop('settings.analyse.showComments', true),
    smallBoard: localstorageprop('settings.analyse.smallBoard', true),
    explorer: {
      db: localstorageprop('settings.analyse.explorer.db', 'lichess'),
      availableRatings: [1600, 1800, 2000, 2200, 2500],
      rating: localstorageprop('settings.analyse.explorer.rating', [1600, 1800, 2000, 2200, 2500]),
      availableSpeeds: ['bullet', 'blitz', 'classical'],
      speed: localstorageprop('settings.analyse.explorer.speed', ['bullet', 'blitz', 'classical'])
    }
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
    color: localstorageprop<Color | 'random'>('settings.ai.color', 'white'),
    opponent: localstorageprop('settings.ai.opponent', '1'),
    variant: localstorageprop<VariantKey>('settings.ai.variant', 'standard'),
    availableVariants: offlineAvailableVariants
  },

  otb: {
    flipPieces: localstorageprop('settings.otb.flipPieces', false),
    useSymmetric: localstorageprop('settings.otb.useSymmetric', false),
    variant: localstorageprop<VariantKey>('settings.otb.variant', 'standard'),
    availableVariants: offlineAvailableVariants,
    whitePlayer: localstorageprop('settings.otb.whitePlayer', 'White'),
    blackPlayer: localstorageprop('settings.otb.blackPlayer', 'Black'),

    clock: {
      availableClocks: [
        ['No Clock', 'none'],
        ['Sudden Death', 'simple'],
        ['Increment', 'increment'],
        ['Increment with Handicap', 'handicapInc'],
        ['Simple Delay', 'delay'],
        ['Bronstein Delay', 'bronstein'],
        ['Hourglass', 'hourglass'],
        ['Stage', 'stage']
      ],

      clockType: localstorageprop<ClockTypeWithNone>('settings.otb.clock.clockType', 'none'),

      simple: {
        time: localstorageprop('settings.otb.clock.simple.time', '5')
      },

      increment: {
        time: localstorageprop('settings.otb.clock.increment.time', '3'),
        increment: localstorageprop('settings.otb.clock.increment.increment', '2')
      },

      handicapInc: {
        topTime: localstorageprop('settings.otb.clock.handicapInc.topTime', '3'),
        topIncrement: localstorageprop('settings.otb.clock.handicapInc.topIncrement', '2'),
        bottomTime: localstorageprop('settings.otb.clock.handicapInc.bottomTime', '3'),
        bottomIncrement: localstorageprop('settings.otb.clock.handicapInc.bottomIncrement', '2')
      },

      delay: {
        time: localstorageprop('settings.otb.clock.delay.time', '3'),
        increment: localstorageprop('settings.otb.clock.delay.increment', '2')
      },

      bronstein: {
        time: localstorageprop('settings.otb.clock.bronstein.time', '3'),
        increment: localstorageprop('settings.otb.clock.bronstein.increment', '2')
      },

      hourglass: {
        time: localstorageprop('settings.otb.clock.hourglass.time', '5')
      },

      stage: {
        stages: localstorageprop('settings.otb.clock.stage.stages', [{time: '120', moves: '40'}, {time: '60', moves: null}]),
        increment: localstorageprop('settings.otb.clock.stage.increment', '30')
      },

      availableTimes: [['0', '0'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90'], ['120', '120'], ['150', '150'], ['180', '180']
      ],

      availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '15', '20', '25', '30', '45', '60', '90', '120', '150', '180'
      ],

      availableMoves: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'
      ]
    }
  },

  clock: {
    availableClocks: [
      ['Sudden Death', 'simple'],
      ['Increment', 'increment'],
      ['Increment with Handicap', 'handicapInc'],
      ['Simple Delay', 'delay'],
      ['Bronstein Delay', 'bronstein'],
      ['Hourglass', 'hourglass'],
      ['Stage', 'stage']
    ],

    clockType: localstorageprop<ClockType>('settings.clock.clockType', 'simple'),

    simple: {
      time: localstorageprop('settings.clock.simple.time', '5')
    },

    increment: {
      time: localstorageprop('settings.clock.increment.time', '3'),
      increment: localstorageprop('settings.clock.increment.increment', '2')
    },

    handicapInc: {
      topTime: localstorageprop('settings.clock.handicapInc.topTime', '3'),
      topIncrement: localstorageprop('settings.clock.handicapInc.topIncrement', '2'),
      bottomTime: localstorageprop('settings.clock.handicapInc.bottomTime', '3'),
      bottomIncrement: localstorageprop('settings.clock.handicapInc.bottomIncrement', '2')
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
    availableTimes: [['0', '0'], ['¼', '0.25'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90'], ['120', '120'], ['150', '150'], ['180', '180']
    ],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '45', '60', '90', '120', '150', '180'
    ],
    availableDays: ['1', '2', '3', '5', '7', '10', '14'],
    isTimeValid: function(gameSettings: GameSettings) {
      return gameSettings.timeMode() !== '1' ||
        gameSettings.time() !== '0' ||
        gameSettings.increment() !== '0'
    },

    ai: {
      color: localstorageprop('settings.game.ai.color', 'random'),
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
      color: localstorageprop('settings.game.human.color', 'random'),
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
      preset: localstorageprop('settings.game.human.preset', 'quick'),
      pool: localstorageprop('settings.game.human.pool', ''),
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

  tournament: {
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
    availableModes: [
      ['Casual', '0'],
      ['Rated', '1']
    ],
    availableTimes: [['0', '0'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['1.5', '1.5'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7']],
    availableIncrements: ['0', '1', '2'],
    availableDurations: ['20', '25', '30', '35', '40', '45', '50', '55', '60', '70', '80', '90', '100', '110', '120'],
    availableTimesToStart: ['1', '2', '3', '5', '10', '15', '20', '30', '45', '60'],
    variant: localstorageprop('settings.tournament.variant', '1'),
    mode: localstorageprop('settings.tournament.mode', '0'),
    time: localstorageprop('settings.tournament.time', '5'),
    increment: localstorageprop('settings.tournament.increment', '0'),
    duration: localstorageprop('settings.tournament.duration', '45'),
    timeToStart: localstorageprop('settings.tournament.timeToStart', '15'),
    position: localstorageprop('settings.tournament.timeToStart', '15'),
    private: localstorageprop('settings.tournament.private', false)
  },

  tv: {
    channel: localstorageprop('settings.tv.channel', 'best')
  },

  importer: {
    analyse: localstorageprop('importer.analyse', false)
  }
}
