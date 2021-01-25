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

const ratingRanges = [...Array(11).keys()].map(x => x * 50)

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
        { key: 'blue', name: 'Blue', ext: 'svg' },
        { key: 'blue2', name: 'Blue 2', ext: 'jpg' },
        { key: 'blue3', name: 'Blue 3', ext: 'jpg' },
        { key: 'blue-marble', name: 'Blue Marble', ext: 'jpg' },
        { key: 'canvas', name: 'Canvas', ext: 'jpg' },
        { key: 'wood', name: 'Wood', ext: 'jpg' },
        { key: 'wood2', name: 'Wood 2', ext: 'jpg' },
        { key: 'wood3', name: 'Wood 3', ext: 'jpg' },
        { key: 'wood4', name: 'Wood 4', ext: 'jpg' },
        { key: 'maple', name: 'Maple', ext: 'jpg' },
        { key: 'maple2', name: 'Maple 2', ext: 'jpg' },
        { key: 'brown', name: 'Brown', ext: 'svg' },
        { key: 'leather', name: 'Leather', ext: 'jpg' },
        { key: 'green', name: 'Green', ext: 'svg' },
        { key: 'marble', name: 'Marble', ext: 'jpg' },
        { key: 'green-plastic', name: 'Green Plastic', ext: 'png' },
        { key: 'grey', name: 'Grey', ext: 'jpg' },
        { key: 'metal', name: 'Metal', ext: 'jpg' },
        { key: 'olive', name: 'Olive', ext: 'jpg' },
        { key: 'newspaper', name: 'Newspaper', ext: 'png' },
        { key: 'purple', name: 'Purple', ext: 'svg' },
        { key: 'purple-diag', name: 'Purple 2', ext: 'png' },
        { key: 'pink', name: 'Pink', ext: 'png' },
        { key: 'ic', name: 'IC', ext: 'svg' },
      ],
      bundledBoardThemes: ['brown', 'blue', 'green', 'purple', 'ic'],
      availablePieceThemes: [
        ['cburnett', 'Colin M.L. Burnett'],
        ['merida' ],
        ['pirouetti' ],
        ['chessnut' ],
        ['chess7' ],
        ['alpha' ],
        ['reilly' ],
        ['companion' ],
        ['riohacha' ],
        ['kosal' ],
        ['leipzig' ],
        ['fantasy' ],
        ['spatial' ],
        ['california'],
        ['pixel'],
        ['maestro'],
        ['fresca'],
        ['cardinal'],
        ['tatiana' ],
        ['staunty' ],
        ['governor'],
        ['symmetric' ],
        ['dubrovny' ],
        ['shapes' ],
        ['letter' ],
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
    rookCastle: prop<0 | 1>('game.rookCastle', 1),
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
    cevalHashSize: prop<number>('ceval.hashSize', 0),
    cevalInfinite: prop<boolean>('ceval.infinite', false),
    cevalMaxDepth: prop<number>('ceval.maxDepth', 18),
    cevalUseNNUE: prop<boolean>('ceval.useNNUE', true),
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
      ['None', 'none']
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
        min: [...ratingRanges].reverse().map(n => ['-' + n, '-' + n]),
        max: ratingRanges.map(n => ['+' + n, '+' + n]),
      },
      ratingRangeMin: prop('game.human.rating.range_min', '-500'),
      ratingRangeMax: prop('game.human.rating.range_max', '+500'),
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
    private: prop('tournament.private', false),
    join: {
      lastTeam: prop('tournament.join.lastTeam', '')
    },
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
  readonly ratingRangeMin: Prop<string>
  readonly ratingRangeMax: Prop<string>
  readonly days: Prop<string>
}

export interface AiSettings extends GameSettings {
  readonly level: Prop<string>
}
