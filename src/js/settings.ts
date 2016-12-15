import store from './storage';
import { range } from 'lodash';

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
];

export interface GameSettings {
  time: SettingsProp<string>
  timeMode: SettingsProp<string>
  increment: SettingsProp<string>
  mode?: SettingsProp<string>
  color: SettingsProp<string>
  variant: SettingsProp<string>
  ratingMin?: SettingsProp<string>
  ratingMax?: SettingsProp<string>
  membersOnly?: SettingsProp<boolean>
  days?: SettingsProp<string>
  level?: SettingsProp<string>
}

export default {
  general: {
    lang: localstorageprop<string>('settings.lang'),
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
    useSymmetric: localstorageprop('settings.otb.useSymmetric', true),
    seeSymmetricCoordinates: localstorageprop('settings.otb.seeSymmetricCoordinates', true),
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
      membersOnly: localstorageprop('settings.game.human.membersOnly', false),
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
    availablePositions: [
      ["Initial Position", "---"],
      ["e4", [
        ["King's Pawn", "B00"],
        ["Open Game", "B00"],
        ["Alekhine's Defence", "B02"],
        ["Alekhine's Defence, Modern Variation", "B04"],
        ["Bishop's Opening", "C23"],
        ["Caro-Kann Defence", "B10"],
        ["Caro-Kann Defence, Advance Variation", "B12"],
        ["Caro-Kann Defence, Classical Variation", "B18"],
        ["Caro-Kann Defence, Exchange Variation", "B13"],
        ["Caro-Kann Defence, Panov-Botvinnik Attack", "B14"],
        ["Caro-Kann Defence, Steinitz Variation", "B14"],
        ["Danish Gambit", "C21"],
        ["Four Knights Game", "C46"],
        ["Four Knights Game, Scotch Variation", "C47"],
        ["Four Knights Game, Spanish Variation", "C48"],
        ["French Defence", "C00"],
        ["French Defence, Advance Variation", "C02"],
        ["French Defence, Burn Variation", "C11"],
        ["French Defence, Classical Variation", "C11"],
        ["French Defence, Exchange Variation", "C01"],
        ["French Defence, Rubinstein Variation", "C10"],
        ["French Defence, Tarrasch Variation", "C03"],
        ["French Defence, Winawer Variation", "C15"],
        ["Giuoco Piano", "C50"],
        ["Italian Game", "C50"],
        ["Italian Game, Evans Gambit", "C51"],
        ["Italian Game, Hungarian Defence", "C50"],
        ["Italian Game, Two Knights Defence", "C55"],
        ["King's Gambit", "C30"],
        ["King's Gambit Accepted", "C33"],
        ["King's Gambit Accepted, Bishop's Gambit", "C33"],
        ["King's Gambit Accepted, Modern Defence", "C36"],
        ["King's Gambit Accepted, Classical Variation", "C30"],
        ["King's Gambit Declined, Classical Variation", "C30"],
        ["King's Gambit Declined, Falkbeer Countergambit", "C31"],
        ["Modern Defence", "B06"],
        ["Modern Defence, Robatsch Defence", "B06"],
        ["Philidor Defence", "C41"],
        ["Pirc Defence", "B07"],
        ["Pirc Defence, Austrian Attack", "B09"],
        ["Pirc Defence, Classical Variation", "B07"],
        ["Petrov's Defence", "C42"],
        ["Petrov's Defence, Classical Attack", "C42"],
        ["Petrov's Defence, Steinitz Attack", "C43"],
        ["Petrov's Defence, Three Knights Game", "C42"],
        ["Ruy Lopez", "C60"],
        ["Ruy Lopez, Berlin Defence", "C65"],
        ["Ruy Lopez, Classical Variation", "C64"],
        ["Ruy Lopez, Closed Variation", "C84"],
        ["Ruy Lopez, Exchange Variation", "C68"],
        ["Ruy Lopez, Marshall Attack", "C89"],
        ["Ruy Lopez, Schliemann Defence", "C63"],
        ["Scandinavian Defence", "B01"],
        ["Scandinavian Defence, Modern Variation", "B01"],
        ["Scotch Game", "C44"],
        ["Scotch Game, Classical Variation", "C45"],
        ["Scotch Game, Mieses Variation", "C45"],
        ["Scotch Game, Steinitz Variation", "C45"],
        ["Sicilian Defence", "B20"],
        ["Sicilian Defence, Accelerated Dragon", "B36"],
        ["Sicilian Defence, Alapin Variation", "B22"],
        ["Sicilian Defence, Closed Variation", "B23"],
        ["Sicilian Defence, Dragon Variation", "B70"],
        ["Sicilian Defence, Grand Prix Attack", "B23"],
        ["Sicilian Defence, Hyper-Accelerated Dragon", "B27"],
        ["Sicilian Defence, Kan Variation", "B41"],
        ["Sicilian Defence, Najdorf Variation", "B90"],
        ["Sicilian Defence, Richter-Rauzer Variation", "B60"],
        ["Sicilian Defence, Scheveningen Variation", "B80"],
        ["Sicilian Defence, Smith-Morra Gambit", "B21"],
        ["Vienna Game", "C27"],
        ["Frankenstein-Dracula Variation", "C27"],
        ["Halloween Gambit", "C47"],
        ["Bongcloud Attack", "420"]
      ]],
      ["d4", [
        ["Queen's Pawn", "A40"],
        ["Benko Gambit", "A57"],
        ["Benoni Defence, Modern Benoni", "A61"],
        ["Benoni Defence, Czech Benoni", "A43"],
        ["Blackmar-Diemer Gambit", "D00"],
        ["Bogo-Indian Defence", "E11"],
        ["Catalan Opening", "E00"],
        ["Catalan Opening, Closed Variation", "E06"],
        ["Dutch Defence", "A80"],
        ["Dutch Defence, Leningrad Variation", "A87"],
        ["Dutch Defence, Staunton Gambit", "A83"],
        ["Dutch Defence, Stonewall Variation", "A92"],
        ["Grünfeld Defence", "D80"],
        ["Grünfeld Defence, Brinckmann Attack", "D82"],
        ["Grünfeld Defence, Exchange Variation", "D85"],
        ["Grünfeld Defence, Russian Variation", "D80"],
        ["Grünfeld Defence, Taimanov Variation", "D90"],
        ["King's Indian Defence", "E61"],
        ["King's Indian Defence, 4.e4", "E77"],
        ["King's Indian Defence, Averbakh Variation", "E73"],
        ["King's Indian Defence, Fianchetto Variation", "E62"],
        ["King's Indian Defence, Four Pawns Attack", "E76"],
        ["King's Indian Defence, Classical Variation", "E91"],
        ["King's Indian Defence, Sämisch Variation", "E80"],
        ["Queens's Pawn Game, Modern Defence", "A41"],
        ["Nimzo-Indian Defence", "E20"],
        ["Nimzo-Indian Defence, Classical Variation", "E32"],
        ["Nimzo-Indian Defence, Fischer Variation", "E43"],
        ["Nimzo-Indian Defence, Hübner Variation", "E41"],
        ["Nimzo-Indian Defence, Kasparov Variation", "E21"],
        ["Nimzo-Indian Defence, Leningrad Variation", "E30"],
        ["Nimzo-Indian Defence, Sämisch Variation", "E26"],
        ["Old Indian Defence", "A53"],
        ["Queen's Gambit", "D06"],
        ["Queen's Gambit Accepted", "D20"],
        ["Queen's Gambit Declined, Semi-Slav Defence", "D43"],
        ["Queen's Gambit Declined, Slav Defence", "D10"],
        ["Queen's Gambit Declined, Semi-Tarrasch Defence", "D40"],
        ["Queen's Gambit Declined, Tarrasch Defence", "D32"],
        ["Queen's Gambit Declined, Albin Countergambit", "D08"],
        ["Queen's Gambit Declined, Chigorin Defence", "D07"],
        ["Queen's Indian Defence", "E12"],
        ["London System", "D02"],
        ["Torre Attack", "D03"],
        ["Richter-Veresov Attack", "D01"],
        ["Budapest Defence", "A52"],
        ["Closed Game", "B00"],
        ["Trompowsky Attack", "A45"]
      ]],
      ["Nf3", [
        ["Zukertort Opening", "A04"],
        ["King's Indian Attack", "A07"],
        ["Réti Opening", "A09"]
      ]],
      ["c4", [
        ["English Opening", "A10"],
        ["English Opening, Reversed Sicilian", "A20"],
        ["English Opening, Symmetrical Variation", "A30"],
        ["English Opening, Closed System", "A26"]
      ]],
      ["b3", [
        ["Nimzo-Larsen Attack", "A01"]
      ]],
      ["g3", [
        ["Hungarian Opening", "AOO"]
      ]]
    ],
    variant: localstorageprop('settings.tournament.variant', '1'),
    mode: localstorageprop('settings.tournament.mode', '0'),
    time: localstorageprop('settings.tournament.time', '5'),
    increment: localstorageprop('settings.tournament.increment', '0'),
    duration: localstorageprop('settings.tournament.duration', '45'),
    timeToStart: localstorageprop('settings.tournament.timeToStart', '15'),
    position: localstorageprop('settings.tournament.timeToStart', '15')
  },

  tv: {
    channel: localstorageprop('settings.tv.channel', 'best')
  },

  importer: {
    analyse: localstorageprop('importer.analyse', false)
  }
};
