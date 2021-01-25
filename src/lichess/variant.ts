import { Variant, VariantKey } from './interfaces/variant'

export const standardFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

interface DocVariant {
  id: number
  name: string
  shortName?: string
  tinyName?: string
  link?: string
  alert?: string
  title: string
  initialFen?: string
}

const variantMap: {[key in VariantKey]: DocVariant} = {
  standard: {
    name: 'Standard',
    tinyName: 'Std',
    id: 1,
    link: 'https://en.wikipedia.org/wiki/Rules_of_chess',
    title: 'Standard rules of chess (FIDE)'
  },
  chess960: {
    name: 'Chess960',
    tinyName: '960',
    id: 2,
    link: 'https://lichess.org/variant/chess960',
    alert: 'This is a Chess960 game!\n\nThe starting position of the pieces on the players\' home ranks is randomized.',
    title: 'Starting position of the home rank pieces is randomized.',
  },
  fromPosition: {
    name: 'From position',
    shortName: 'Fen',
    tinyName: 'Fen',
    id: 3,
    title: 'Custom starting position',
  },
  kingOfTheHill: {
    name: 'King of the Hill',
    shortName: 'KotH',
    tinyName: 'KotH',
    id: 4,
    link: 'https://lichess.org/variant/kingOfTheHill',
    alert: 'This is a King of the Hill game!\n\nThe game can be won by bringing the king to the center.',
    title: 'Bring your King to the center to win the game.',
  },
  threeCheck: {
    name: 'Three-check',
    shortName: '3-check',
    tinyName: '3+',
    id: 5,
    link: 'https://lichess.org/variant/threeCheck',
    alert: 'This is a Three-check game!\n\nThe game can be won by checking the opponent 3 times.',
    title: 'Check your opponent 3 times to win the game.',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 +0+0'
  },
  antichess: {
    name: 'Antichess',
    tinyName: 'Anti',
    id: 6,
    link: 'https://lichess.org/variant/antichess',
    alert: 'This is an antichess chess game!\n\n If you can take a piece, you must. The game can be won by losing all your pieces.',
    title: 'Lose all your pieces (or reach a stalemate) to win the game.',
  },
  atomic: {
    name: 'Atomic',
    tinyName: 'Atom',
    id: 7,
    link: 'https://lichess.org/variant/atomic',
    alert: 'This is an atomic chess game!\n\nCapturing a piece causes an explosion, taking out your piece and surrounding non-pawns. Win by mating or exploding your opponent\'s king.',
    title: 'Nuke your opponent\'s king to win.',
  },
  horde: {
    name: 'Horde',
    tinyName: 'Horde',
    id: 8,
    link: 'https://lichess.org/variant/horde',
    alert: 'This is a horde chess game!\n\nBlack must take all white pawns to win. White must checkmate black king.',
    title: 'Destroy the horde to win!',
    initialFen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1'
  },
  racingKings: {
    name: 'Racing Kings',
    shortName: 'Racing',
    tinyName: 'Racing',
    id: 9,
    link: 'https://lichess.org/variant/racingKings',
    alert: 'Race to the eighth rank to win.',
    title: 'Race your King to the eighth rank to win.',
    initialFen: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1'
  },
  crazyhouse: {
    name: 'Crazyhouse',
    tinyName: 'Crazy',
    id: 10,
    link: 'https://lichess.org/variant/crazyhouse',
    alert: 'This is a crazyhouse game!\n\nEvery time a piece is captured the capturing player gets a piece of the same type and of their color in their pocket.',
    title: 'Captured pieces can be dropped back on the board instead of moving a piece.',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/ w KQkq - 0 1'
  }
}

export function isVariant(key: VariantKey): boolean {
  return !(key === 'standard' || key === 'fromPosition')
}

export function getVariant(key: VariantKey): DocVariant {
  return variantMap[key]
}

export function getLichessVariant(key: VariantKey): Variant {
  const dv = variantMap[key]
  return {
    key,
    name: dv.name,
    short: dv.shortName || dv.tinyName || dv.name,
    title: dv.title
  }
}

export function getInitialFen(key: VariantKey): string {
  const v = variantMap[key]
  return v.initialFen || standardFen
}

export const specialFenVariants = new Set(['crazyhouse', 'threeCheck']) as Set<VariantKey>

export const openingSensibleVariants = new Set([
'standard', 'crazyhouse', 'threeCheck', 'kingOfTheHill'
]) as Set<VariantKey>
