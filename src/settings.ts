import store, { StoredProp } from './storage'
import * as range from 'lodash/range'
import { ClockType, ClockTypeWithNone } from './ui/shared/clock/interfaces'

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
  readonly time: StoredProp<string>
  readonly timeMode: StoredProp<string>
  readonly increment: StoredProp<string>
  readonly color: StoredProp<string>
  readonly mode?: StoredProp<string>
  readonly variant: StoredProp<string>
  readonly ratingMin?: StoredProp<string>
  readonly ratingMax?: StoredProp<string>
  readonly days?: StoredProp<string>
  readonly level?: StoredProp<string>
}

export interface HumanSettings extends GameSettings {
  readonly mode: StoredProp<string>
  readonly ratingMin: StoredProp<string>
  readonly ratingMax: StoredProp<string>
  readonly days: StoredProp<string>
}

export interface AiSettings extends GameSettings {
  readonly level: StoredProp<string>
}

export default {
  general: {
    lang: store.prop<string | null>('settings.lang', null),
    sound: store.prop('settings.sound', true),
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
      background: store.prop('settings.bgTheme', 'dark'),
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
        'companion',
        'fantasy',
        'shapes',
        'chessnut',
        'chess7',
        'riohacha',
        'symmetric',
      ],
      board: store.prop('settings.theme.board', 'brown'),
      piece: store.prop('settings.theme.piece', 'cburnett')
    },
    vibrateOnGameEvents: store.prop('settings.vibrateOnGameEvents', false),
    notifications: {
      allow: store.prop('settings.notifications', true),
      vibrate: store.prop('settings.notifications.vibrate', true),
      sound: store.prop('settings.notifications.sound', true)
    }
  },

  game: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    animations: store.prop<boolean>('settings.gameAnimations', true),
    highlights: store.prop<boolean>('settings.boardHighlights', true),
    pieceDestinations: store.prop<boolean>('settings.pieceDestinations', true),
    coords: store.prop<boolean>('settings.coords', true),
    magnified: store.prop<boolean>('settings.pieceMagnified', true),
    pieceNotation: store.prop<boolean>('settings.pieceNotation', true),
    zenMode: store.prop<boolean>('settings.zenMode', false),
    clockPosition: store.prop<'right' | 'left'>('settings.game.inversedClockPos', 'right'),
    pieceMove: store.prop<'tap' | 'drag' | 'both'>('settings.game.pieceMove', 'both'),
  },

  analyse: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    availableVariants: offlineAvailableVariants,
    syntheticVariant: store.prop<VariantKey>('settings.analyse.syntheticVariant', 'standard'),
    enableCeval: store.prop('settings.analyse.enableCeval', false),
    cevalMultiPvs: store.prop<number>('settings.ceval.multipv', 1),
    cevalCores: store.prop<number>('settings.ceval.cores', 1),
    cevalInfinite: store.prop<boolean>('settings.ceval.infinite', false),
    showBestMove: store.prop('settings.analyse.showBestMove', true),
    showComments: store.prop('settings.analyse.showComments', true),
    smallBoard: store.prop('settings.analyse.smallBoard', true),
    explorer: {
      db: store.prop('settings.analyse.explorer.db', 'lichess'),
      availableRatings: [1600, 1800, 2000, 2200, 2500],
      rating: store.prop('settings.analyse.explorer.rating', [1600, 1800, 2000, 2200, 2500]),
      availableSpeeds: ['bullet', 'blitz', 'rapid', 'classical'],
      speed: store.prop('settings.analyse.explorer.speed', ['bullet', 'blitz', 'rapid', 'classical'])
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
    color: store.prop<Color | 'random'>('settings.ai.color', 'white'),
    opponent: store.prop('settings.ai.opponent', '1'),
    variant: store.prop<VariantKey>('settings.ai.variant', 'standard'),
    availableVariants: offlineAvailableVariants
  },

  otb: {
    flipPieces: store.prop('settings.otb.flipPieces', false),
    useSymmetric: store.prop('settings.otb.useSymmetric', false),
    variant: store.prop<VariantKey>('settings.otb.variant', 'standard'),
    availableVariants: offlineAvailableVariants,
    whitePlayer: store.prop('settings.otb.whitePlayer', 'White'),
    blackPlayer: store.prop('settings.otb.blackPlayer', 'Black'),

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

      clockType: store.prop<ClockTypeWithNone>('settings.otb.clock.clockType', 'none'),

      simple: {
        time: store.prop('settings.otb.clock.simple.time', '5')
      },

      increment: {
        time: store.prop('settings.otb.clock.increment.time', '3'),
        increment: store.prop('settings.otb.clock.increment.increment', '2')
      },

      handicapInc: {
        topTime: store.prop('settings.otb.clock.handicapInc.topTime', '3'),
        topIncrement: store.prop('settings.otb.clock.handicapInc.topIncrement', '2'),
        bottomTime: store.prop('settings.otb.clock.handicapInc.bottomTime', '3'),
        bottomIncrement: store.prop('settings.otb.clock.handicapInc.bottomIncrement', '2')
      },

      delay: {
        time: store.prop('settings.otb.clock.delay.time', '3'),
        increment: store.prop('settings.otb.clock.delay.increment', '2')
      },

      bronstein: {
        time: store.prop('settings.otb.clock.bronstein.time', '3'),
        increment: store.prop('settings.otb.clock.bronstein.increment', '2')
      },

      hourglass: {
        time: store.prop('settings.otb.clock.hourglass.time', '5')
      },

      stage: {
        stages: store.prop('settings.otb.clock.stage.stages', [{time: '120', moves: '40'}, {time: '60', moves: null}]),
        increment: store.prop('settings.otb.clock.stage.increment', '30')
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

    clockType: store.prop<ClockType>('settings.clock.clockType', 'simple'),

    simple: {
      time: store.prop('settings.clock.simple.time', '5')
    },

    increment: {
      time: store.prop('settings.clock.increment.time', '3'),
      increment: store.prop('settings.clock.increment.increment', '2')
    },

    handicapInc: {
      topTime: store.prop('settings.clock.handicapInc.topTime', '3'),
      topIncrement: store.prop('settings.clock.handicapInc.topIncrement', '2'),
      bottomTime: store.prop('settings.clock.handicapInc.bottomTime', '3'),
      bottomIncrement: store.prop('settings.clock.handicapInc.bottomIncrement', '2')
    },

    delay: {
      time: store.prop('settings.clock.delay.time', '3'),
      increment: store.prop('settings.clock.delay.increment', '2')
    },

    bronstein: {
      time: store.prop('settings.clock.bronstein.time', '3'),
      increment: store.prop('settings.clock.bronstein.increment', '2')
    },

    hourglass: {
      time: store.prop('settings.clock.hourglass.time', '5')
    },

    stage: {
      stages: store.prop('settings.clock.stage.stages', [{time: '120', moves: '40'}, {time: '60', moves: null}]),
      increment: store.prop('settings.clock.stage.increment', '30')
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
      color: store.prop('settings.game.ai.color', 'random'),
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
      variant: store.prop('settings.game.ai.variant', '1'),
      availableTimeModes: [
        ['unlimited', '0'],
        ['realTime', '1']
      ],
      timeMode: store.prop('settings.game.ai.clock', '1'),
      time: store.prop('settings.game.ai.time', '10'),
      increment: store.prop('settings.game.ai.increment', '0'),
      days: store.prop('settings.game.ai.days', '2'),
      level: store.prop('settings.game.ai.aiLevel', '3')
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
      ratingMin: store.prop('settings.game.human.rating.min', '800'),
      ratingMax: store.prop('settings.game.human.rating.max', '2900'),
      color: store.prop('settings.game.human.color', 'random'),
      variant: store.prop('settings.game.human.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: store.prop('settings.game.human.clock', '1'),
      time: store.prop('settings.game.human.time', '5'),
      increment: store.prop('settings.game.human.increment', '0'),
      days: store.prop('settings.game.human.days', '2'),
      mode: store.prop('settings.game.human.mode', '0'),
      preset: store.prop('settings.game.human.preset', 'quick'),
      pool: store.prop('settings.game.human.pool', ''),
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
      color: store.prop('settings.game.invite.color', 'random'),
      variant: store.prop('settings.game.invite.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: store.prop('settings.game.invite.clock', '1'),
      time: store.prop('settings.game.invite.time', '5'),
      increment: store.prop('settings.game.invite.increment', '0'),
      days: store.prop('settings.game.invite.days', '2'),
      mode: store.prop('settings.game.invite.mode', '0')
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
    variant: store.prop('settings.tournament.variant', '1'),
    mode: store.prop('settings.tournament.mode', '0'),
    time: store.prop('settings.tournament.time', '5'),
    increment: store.prop('settings.tournament.increment', '0'),
    duration: store.prop('settings.tournament.duration', '45'),
    timeToStart: store.prop('settings.tournament.timeToStart', '15'),
    position: store.prop('settings.tournament.timeToStart', '15'),
    private: store.prop('settings.tournament.private', false)
  },

  tv: {
    channel: store.prop('settings.tv.channel', 'best')
  },

  importer: {
    analyse: store.prop('importer.analyse', false)
  },

  training: {
    puzzleBufferLen: 50,
    ratingDiffThreshold: 100
  },

  study: {
    tour: store.prop<string | null>('study.tour', null)
  },
}
