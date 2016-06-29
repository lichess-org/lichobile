const variantMap = {
  standard: {
    name: 'Standard',
    tinyName: 'Std',
    id: 1,
    link: 'https://en.wikipedia.org/wiki/Chess'
  },
  chess960: {
    name: 'Chess960',
    tinyName: '960',
    id: 2,
    link: 'https://lichess.org/variant/chess960',
    alert: 'This is a Chess960 game!\n\nThe starting position of the pieces on the players\' home ranks is randomized.'
  },
  fromPosition: {
    name: 'From position',
    shortName: 'Fen',
    tinyName: 'Fen',
    id: 3
  },
  kingOfTheHill: {
    name: 'King of the Hill',
    shortName: 'KotH',
    tinyName: 'KotH',
    id: 4,
    link: 'https://lichess.org/variant/kingOfTheHill',
    alert: 'This is a King of the Hill game!\n\nThe game can be won by bringing the king to the center.'
  },
  threeCheck: {
    name: 'Three-check',
    shortName: '3-check',
    tinyName: '3+',
    id: 5,
    link: 'https://lichess.org/variant/threeCheck',
    alert: 'This is a Three-check game!\n\nThe game can be won by checking the opponent 3 times.'
  },
  antichess: {
    name: 'Antichess',
    tinyName: 'Anti',
    id: 6,
    link: 'https://lichess.org/variant/antichess',
    alert: 'This is an antichess chess game!\n\n If you can take a piece, you must. The game can be won by losing all your pieces.'
  },
  atomic: {
    name: 'Atomic',
    tinyName: 'Atom',
    id: 7,
    link: 'https://lichess.org/variant/atomic',
    alert: 'This is an atomic chess game!\n\nCapturing a piece causes an explosion, taking out your piece and surrounding non-pawns. Win by mating or exploding your opponent\'s king.'
  },
  horde: {
    name: 'Horde',
    tinyName: 'Horde',
    id: 8,
    link: 'https://lichess.org/variant/horde',
    alert: 'This is a horde chess game!\n\nWhite must take all black pawns to win. Black must checkmate white king.'
  },
  racingKings: {
    name: 'Racing Kings',
    shortName: 'Racing',
    tinyName: 'Racing',
    id: 9,
    link: 'https://lichess.org/variant/racingKings',
    alert: 'Race to the eighth rank to win.'
  },
  crazyhouse: {
    name: 'Crazyhouse',
    tinyName: 'Crazy',
    id: 10,
    link: 'https://lichess.org/variant/crazyhouse',
    alert: 'This is a crazyhouse game!\n\nEvery time a piece is captured the capturing player gets a piece of the same type and of their color in their pocket.'
  }
};

export default function getVariant(key) {
  return variantMap[key];
}
