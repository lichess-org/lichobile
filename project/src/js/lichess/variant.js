const variantMap = {
  standard: {
    name: 'Standard',
    shortName: 'STD',
    id: 1,
    link: 'https://en.wikipedia.org/wiki/Chess'
  },
  chess960: {
    name: 'Chess960',
    shortName: '960',
    id: 2,
    link: 'https://en.wikipedia.org/wiki/Chess960',
    alert: 'This is a Chess960 game!\n\nThe starting position of the pieces on the players\' home ranks is randomized.'
  },
  fromPosition: {
    name: 'From position',
    shortName: 'FEN',
    id: 3
  },
  kingOfTheHill: {
    name: 'King of the Hill',
    shortName: 'KotH',
    id: 4,
    link: 'http://lichess.org/king-of-the-hill',
    alert: 'This is a King of the Hill game!\n\nThe game can be won by bringing the king to the center.'
  },
  threeCheck: {
    name: 'Three-check',
    shortName: '3+',
    id: 5,
    link: 'http://en.wikipedia.org/wiki/Three-check_chess',
    alert: 'This is a Three-check game!\n\nThe game can be won by checking the opponent 3 times.'
  },
  antichess: {
    name: 'Antichess',
    shortName: 'Anti',
    id: 6,
    link: 'http://en.wikipedia.org/wiki/Losing_chess',
    alert: 'This is an antichess chess game!\n\n If you can take a piece, you must. The game can be won by losing all your pieces.'
  },
  atomic: {
    name: 'Atomic',
    shortName: 'Atom',
    id: 7,
    link: 'http://www.freechess.org/Help/HelpFiles/atomic.html',
    alert: 'This is an atomic chess game!\n\nCapturing a piece causes an explosion, taking out your piece and surrounding non-pawns. Win by mating or exploding your opponent\'s king.'
  },
  horde: {
    name: 'Horde',
    shortName: 'Horde',
    id: 8,
    link: 'http://en.wikipedia.org/wiki/Dunsany%27s_chess',
    alert: 'This is a horde chess game!\n\nWhite must take all black pawns to win. Black must checkmate white king.'
  },
  racingKings: {
    name: 'Racing Kings',
    shortName: 'Racing',
    id: 9,
    link: 'http://lichess.org/racing-kings',
    alert: 'Race to the eighth rank to win.'
  },
  crazyhouse: {
    name: 'Crazyhouse',
    shortName: 'crazy',
    id: 10,
    link: 'http://lichess.org/crazyhouse',
    alert: 'This is a crazyhouse game!\n\nEvery time a piece is captured the capturing player gets a piece of the same type and of their color in their pocket.'
  }
};

export default function getVariant(key) {
  return variantMap[key];
}
