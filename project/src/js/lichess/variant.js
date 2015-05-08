
const variantMap = {
  standard: { name: 'Standard', shortName: 'STD', id: 1},
  chess960: { name: 'Chess960', shortName: '960', id: 2},
  fromPosition: { name: 'From position', shortName: 'FEN', id: 3},
  kingOfTheHill: { name: 'King of the Hill', shortName: 'KotH', id: 4 },
  threeCheck: { name: 'Three-check', shortName: '3+', id: 5},
  antichess: { name: 'Antichess', shortName: 'Anti', id: 6},
  atomic: { name: 'Atomic', shortName: 'Atom', id: 7},
  horde: { name: 'Horde', shortName: 'Horde', id: 8}
};

export default function getVariant(key) {
  return variantMap[key];
}
