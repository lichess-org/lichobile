import store from './storage';
import * as range from 'lodash/range';
import {SearchStateSetting} from './ui/search/interfaces';

export interface SettingsProp<T> {
  (): T
  (value: T): T;
}

function localstorageprop<T>(key: string, initialValue?: T): SettingsProp<T> {
  return function(): T {
    if (arguments.length) store.set(key, arguments[0]);
    const ret = store.get<T>(key);
    return (ret !== null) ? ret : initialValue;
  };
}

function tupleOf(x: number) {
  return [x.toString(), x.toString()];
}

const offlineAvailableVariants = [
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
  mode?: SettingsProp<string>
  color: SettingsProp<string>
  variant: SettingsProp<string>
  ratingMin?: SettingsProp<string>
  ratingMax?: SettingsProp<string>
  days?: SettingsProp<string>
  level?: SettingsProp<string>
}

export default {
  general: {
    lang: localstorageprop<string>('settings.lang'),
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
    magnified: localstorageprop('settings.pieceMagnified', true),
    pieceNotation: localstorageprop('settings.pieceNotation', true)
  },

  analyse: {
    supportedVariants: ['standard', 'chess960', 'antichess', 'fromPosition',
      'kingOfTheHill', 'threeCheck', 'atomic', 'horde', 'racingKings', 'crazyhouse'
    ],
    availableVariants: offlineAvailableVariants,
    syntheticVariant: localstorageprop('settings.analyse.syntheticVariant', 'standard'),
    enableCeval: localstorageprop('settings.analyse.enableCeval', false),
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
    color: localstorageprop('settings.ai.color', 'white'),
    opponent: localstorageprop('settings.ai.opponent', '1'),
    variant: localstorageprop('settings.ai.variant', 'standard'),
    availableVariants: offlineAvailableVariants
  },

  otb: {
    flipPieces: localstorageprop('settings.otb.flipPieces', false),
    useSymmetric: localstorageprop('settings.otb.useSymmetric', false),
    variant: localstorageprop('settings.otb.variant', 'standard'),
    availableVariants: offlineAvailableVariants
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

    clockType: localstorageprop('settings.clock.clockType', 'simple'),

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
    availableTimes: [['0', '0'], ['½', '0.5'], ['¾', '0.75'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90'], ['120', '120'], ['150', '150'], ['180', '180']
    ],
    availableIncrements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '15', '20', '25', '30', '45', '60', '90', '120', '150', '180'
    ],
    availableDays: ['1', '2', '3', '5', '7', '10', '14'],
    isTimeValid: function(gameSettings: GameSettings) {
      return gameSettings.timeMode() !== '1' ||
        gameSettings.time() !== '0' ||
        gameSettings.increment() !== '0';
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

  search: {
    ratings: ['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400', '2500', '2600', '2700', '2800', '2900'],
    aiLevels: ['1', '2', '3', '4', '5', '6', '7', '8'],
    sources: [['1', 'Lobby'], ['2', 'Friend'], ['3', 'Ai'], ['6', 'Position'], ['7', 'Import'], ['5', 'Tournament'], ['10', 'Simul'], ['12', 'Pool']],
    perfs: [['1', 'Bullet'], ['2', 'Blitz'], ['3', 'Classical'], ['4', 'Correspondence'], ['18', 'Crazyhouse'], ['11', 'Chess960'], ['12', 'King of the Hill'], ['15', 'Three-check'], ['13', 'Anticheck'], ['14', 'Atomic'], ['16', 'Horde'], ['17', 'Racing Kings']],
    turns: ['1', '2', '3', '4', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '60', '70', '80', '90', '100', '125', '150', '175', '200', '225', '250', '275', '300'],
    durations: [['30', '30 seconds'], ['60', '1 minute'], ['120', '2 minutes'], ['300', '5 minutes'], ['600', '10 minutes'], ['900', '15 minutes'], ['1200', '20 minutes'], ['1800', '30 minutes'], ['3600', '1 hour'], ['10800', '3 hours'], ['86400', '1 day'], ['259200', '3 days'], ['604800', '1 week'], ['1209600', '2 weeks'], ['2592000', '1 month'], ['7776000', '3 months'], ['15552000', '6 months'], ['31536000', '1 year']],
    times: [['0', '0 seconds'], ['30', '30 seconds'], ['45', '45 seconds'], ['60', '1 minute'], ['120', '2 minutes'], ['180', '3 minutes'], ['300', '5 minutes'], ['600', '10 minutes'], ['900', '15 minutes'], ['1200', '20 minutes'], ['1800', '30 minutes'], ['2700', '45 minutes'], ['3600', '60 minutes'], ['5400', '90 minutes'], ['7200', '120 minutes'], ['9000', '150 minutes'], ['10800', '180 minutes']],
    increments: [['0', '0 seconds'], ['1', '1 second'], ['2', '2 seconds'], ['3', '3 seconds'], ['5', '5 seconds'], ['10', '10 seconds'], ['15', '15 seconds'], ['30', '30 seconds'], ['45', '45 seconds'], ['60', '60 seconds'], ['90', '90 seconds'], ['120', '120 seconds'], ['150', '150 seconds'], ['180', '180 seconds']],
    results: [['30', 'Mate'], ['31', 'Resign'], ['32', 'Stalemate'], ['34', 'Draw'], ['35', 'Clock Flag'], ['60', 'Variant End']],
    winners: [['1', 'white'], ['2', 'black'], ['3', 'none']],
    dates: [['0d', 'Now'], ['1h', '1 hour ago'], ['2h', '2 hours ago'], ['6h', '6 hours ago'], ['1d', '1 day ago'], ['2d', '2 days ago'], ['3d', '3 days ago'], ['4d', '4 days ago'], ['5d', '5 days ago'], ['6d', '6 days ago'], ['1w', '1 week ago'], ['2w', '2 weeks ago'], ['3w', '3 weeks ago'], ['4w', '4 weeks ago'], ['5w', '5 weeks ago'], ['6w', '6 weeks ago'], ['1m', '1 month ago'], ['2m', '2 months ago'], ['3m', '3 months ago'], ['4m', '4 months ago'], ['5m', '5 months ago'], ['6m', '6 months ago'], ['1y', '1 year ago'], ['2y', '2 years ago'], ['3y', '3 years ago'], ['4y', '4 years ago'], ['5y', '5 years ago']],
    sortFields: [['d', 'Date'], ['t', 'Moves'], ['a', 'Rating']],
    sortOrders: [['desc', 'Descending'], ['asc', 'Ascending']],
    state: localstorageprop<SearchStateSetting>('settings.search.state', {})
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
