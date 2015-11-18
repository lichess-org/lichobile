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
    link: 'https://en.wikipedia.org/wiki/Chess960'
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
    link: 'http://lichess.org/king-of-the-hill'
  },
  threeCheck: {
    name: 'Three-check',
    shortName: '3+',
    id: 5,
    link: 'http://en.wikipedia.org/wiki/Three-check_chess'
  },
  antichess: {
    name: 'Antichess',
    shortName: 'Anti',
    id: 6,
    link: 'http://en.wikipedia.org/wiki/Losing_chess'
  },
  atomic: {
    name: 'Atomic',
    shortName: 'Atom',
    id: 7,
    link: 'http://www.freechess.org/Help/HelpFiles/atomic.html'
  },
  horde: {
    name: 'Horde',
    shortName: 'Horde',
    id: 8,
    link: 'http://en.wikipedia.org/wiki/Dunsany%27s_chess'
  }
};

export default function getVariant(key) {
  return variantMap[key];
}
