import asyncStorage from './asyncStorage'
import { getAtPath, setAtPath } from './utils/object'
import { ClockType } from './ui/shared/clock/interfaces'

const STORAGE_KEY = 'settings'

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

const availableClocks = [
  ['Sudden Death', 'simple'],
  ['Increment', 'increment'],
  ['Increment with Handicap', 'handicapInc'],
  ['Simple Delay', 'delay'],
  ['Bronstein Delay', 'bronstein'],
  ['Hourglass', 'hourglass'],
  ['Stage', 'stage'],
]

const minRatingRanges = [
  ['800', '800'],
  ['900', '900'],
  ['1000', '1000'],
  ['1100', '1100'],
  ['1200', '1200'],
  ['1300', '1300'],
  ['1400', '1400'],
  ['1500', '1500'],
  ['1600', '1600'],
  ['1700', '1700'],
  ['1800', '1800'],
  ['1900', '1900'],
  ['2000', '2000'],
  ['2100', '2100'],
  ['2200', '2200'],
  ['2300', '2300'],
  ['2400', '2400'],
  ['2500', '2500'],
  ['2600', '2600'],
  ['2700', '2700'],
  ['2800', '2800'],
]

const settingsStore = {}

export function init(): Promise<void> {
  return asyncStorage.get(STORAGE_KEY)
  .then(data => {
    Object.assign(settingsStore, data)
  })
}

export default {
  general: {
    lang: prop<string | null>('lang', null),
    sound: prop<boolean>('sound', true),
    theme: {
      availableBackgroundThemes: [
        { key: 'dark', name: 'dark', ext: '' },
        { key: 'light', name: 'light', ext: '' },
        { key: 'bgshapes', name: 'Shapes', ext: 'jpg' },
        { key: 'anthracite', name: 'Anthracite', ext: 'jpg' },
        { key: 'blue-maze', name: 'Blue Maze', ext: 'jpg' },
        { key: 'red-maze', name: 'Red Maze', ext: 'jpg' },
        { key: 'checkerboard', name: 'Checkerboard', ext: 'png' },
        { key: 'wood', name: 'Wood', ext: 'jpg' },
        { key: 'space', name: 'Space', ext: 'jpg' },
      ],
      availableBoardThemes: [
        ['Brown', 'brown'],
        ['Blue', 'blue'],
        ['Green', 'green'],
        ['Grey', 'grey'],
        ['Purple', 'purple'],
        ['Wood', 'wood'],
        ['Wood 2', 'wood2'],
        ['Wood 3', 'wood3'],
        ['Maple', 'maple'],
        ['Blue 2', 'blue3'],
        ['Canvas', 'canvas'],
        ['Metal', 'metal']
      ],
      availablePieceThemes: [
        ['cburnett', 'Colin M.L. Burnett'],
        ['merida' ],
        ['pirouetti' ],
        ['alpha' ],
        ['spatial' ],
        ['reilly' ],
        ['companion' ],
        ['kosal' ],
        ['leipzig' ],
        ['fantasy' ],
        ['shapes' ],
        ['letter' ],
        ['chessnut' ],
        ['chess7' ],
        ['riohacha' ],
        ['symmetric' ],
        ['neo' ],
      ],
      background: prop('bgTheme', 'dark'),
      board: prop('theme.board', 'brown'),
      piece: prop('theme.piece', 'cburnett')
    },
    vibrateOnGameEvents: prop('vibrateOnGameEvents', false),
    notifications: {
      allow: prop<boolean>('notifications', true),
      vibrate: prop<boolean>('notifications.vibrate', true),
      sound: prop<boolean>('notifications.sound', true)
    }
  },

  game: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    animations: prop<boolean>('gameAnimations', true),
    highlights: prop<boolean>('boardHighlights', true),
    pieceDestinations: prop<boolean>('pieceDestinations', true),
    coords: prop<boolean>('coords', true),
    magnified: prop<boolean>('pieceMagnified', true),
    pieceNotation: prop<boolean>('pieceNotation', true),
    zenMode: prop<boolean>('zenMode', false),
    clockPosition: prop<'right' | 'left'>('game.inversedClockPos', 'right'),
    pieceMove: prop<'tap' | 'drag' | 'both'>('game.pieceMove', 'both'),
    moveList: prop<boolean>('game.moveList', true),
  },

  analyse: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    availableVariants: offlineAvailableVariants,
    syntheticVariant: prop<VariantKey>('analyse.syntheticVariant', 'standard'),
    enableCeval: prop<boolean>('analyse.enableCeval', false),
    cevalMultiPvs: prop<number>('ceval.multipv', 1),
    cevalCores: prop<number>('ceval.cores', 1),
    cevalInfinite: prop<boolean>('ceval.infinite', false),
    showBestMove: prop('analyse.showBestMove', true),
    showComments: prop('analyse.showComments', true),
    smallBoard: prop<boolean>('analyse.smallBoard', true),
    explorer: {
      db: prop('analyse.explorer.db', 'lichess'),
      availableRatings: [1600, 1800, 2000, 2200, 2500],
      rating: prop('analyse.explorer.rating', [1600, 1800, 2000, 2200, 2500]),
      availableSpeeds: ['bullet', 'blitz', 'rapid', 'classical'],
      speed: prop('analyse.explorer.speed', ['bullet', 'blitz', 'rapid', 'classical'])
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
    color: prop<Color | 'random'>('ai.color', 'white'),
    opponent: prop('ai.opponent', '1'),
    variant: prop<VariantKey>('ai.variant', 'standard'),
    availableVariants: offlineAvailableVariants
  },

  otb: {
    flipPieces: prop('otb.flipPieces', false),
    useSymmetric: prop('otb.useSymmetric', false),
    variant: prop<VariantKey>('otb.variant', 'standard'),
    availableVariants: offlineAvailableVariants,
    whitePlayer: prop('otb.whitePlayer', 'White'),
    blackPlayer: prop('otb.blackPlayer', 'Black'),
    clockType: prop<ClockType | 'none'>('otb.clockType', 'none'),
    availableClocks: [
      ['none', 'None']
    ].concat(availableClocks)
  },

  clock: {
    availableClocks,
    clockType: prop<ClockType>('clock.clockType', 'simple'),
    simple: {
      time: prop('clock.simple.time', '5')
    },
    increment: {
      time: prop('clock.increment.time', '3'),
      increment: prop('clock.increment.increment', '2')
    },
    handicapInc: {
      topTime: prop('clock.handicapInc.topTime', '3'),
      topIncrement: prop('clock.handicapInc.topIncrement', '2'),
      bottomTime: prop('clock.handicapInc.bottomTime', '3'),
      bottomIncrement: prop('clock.handicapInc.bottomIncrement', '2')
    },
    delay: {
      time: prop('clock.delay.time', '3'),
      increment: prop('clock.delay.increment', '2')
    },
    bronstein: {
      time: prop('clock.bronstein.time', '3'),
      increment: prop('clock.bronstein.increment', '2')
    },
    hourglass: {
      time: prop('clock.hourglass.time', '5')
    },
    stage: {
      stages: prop('clock.stage.stages', [{time: '120', moves: '40'}, {time: '60', moves: null}]),
      increment: prop('clock.stage.increment', '30')
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
      color: prop('game.ai.color', 'random'),
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
      variant: prop('game.ai.variant', '1'),
      availableTimeModes: [
        ['unlimited', '0'],
        ['realTime', '1']
      ],
      timeMode: prop('game.ai.clock', '1'),
      time: prop('game.ai.time', '10'),
      increment: prop('game.ai.increment', '0'),
      days: prop('game.ai.days', '2'),
      level: prop('game.ai.aiLevel', '3')
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
        min: minRatingRanges,
        max: [
          ...minRatingRanges,
          ['2900', '2900']
        ].slice(1)
      },
      ratingMin: prop('game.human.rating.min', '800'),
      ratingMax: prop('game.human.rating.max', '2900'),
      color: prop('game.human.color', 'random'),
      variant: prop('game.human.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: prop('game.human.clock', '1'),
      time: prop('game.human.time', '5'),
      increment: prop('game.human.increment', '0'),
      days: prop('game.human.days', '2'),
      mode: prop('game.human.mode', '0'),
      preset: prop('game.human.preset', 'quick'),
      pool: prop('game.human.pool', ''),
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
      color: prop('game.invite.color', 'random'),
      variant: prop('game.invite.variant', '1'),
      availableTimeModes: [
        ['realTime', '1'],
        ['correspondence', '2'],
        ['unlimited', '0']
      ],
      timeMode: prop('game.invite.clock', '1'),
      time: prop('game.invite.time', '5'),
      increment: prop('game.invite.increment', '0'),
      days: prop('game.invite.days', '2'),
      mode: prop('game.invite.mode', '0')
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
    variant: prop('tournament.variant', '1'),
    mode: prop('tournament.mode', '0'),
    time: prop('tournament.time', '5'),
    increment: prop('tournament.increment', '0'),
    duration: prop('tournament.duration', '45'),
    timeToStart: prop('tournament.timeToStart', '15'),
    position: prop('tournament.timeToStart', '15'),
    private: prop('tournament.private', false)
  },

  tv: {
    channel: prop('tv.channel', 'best')
  },

  importer: {
    analyse: prop('importer.analyse', false)
  },

  training: {
    puzzleBufferLen: 50,
    ratingDiffThreshold: 100
  },

  study: {
    tour: prop<string | null>('study.tour', null)
  },
}

export interface Prop<T> {
  (): T
  (value: T): T
}

function prop<T>(key: string, initialValue: T): Prop<T> {
  return function(value?: T): T {
    if (value !== undefined) {
      setAtPath(settingsStore, key, value)
      asyncStorage.set(STORAGE_KEY, settingsStore)
      .then(() => {
        console.debug(`${key}:${value} settings successfully persisted`)
      })
      return value
    }
    const ret: T = getAtPath(settingsStore, key)
    return ret !== undefined ? ret : initialValue
  }
}

export interface GameSettings {
  readonly time: Prop<string>
  readonly timeMode: Prop<string>
  readonly increment: Prop<string>
  readonly color: Prop<string>
  readonly mode?: Prop<string>
  readonly variant: Prop<string>
  readonly ratingMin?: Prop<string>
  readonly ratingMax?: Prop<string>
  readonly days?: Prop<string>
  readonly level?: Prop<string>
}

export interface HumanSettings extends GameSettings {
  readonly mode: Prop<string>
  readonly ratingMin: Prop<string>
  readonly ratingMax: Prop<string>
  readonly days: Prop<string>
}

export interface AiSettings extends GameSettings {
  readonly level: Prop<string>
}
