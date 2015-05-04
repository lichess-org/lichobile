
const variantMap = {
  standard: { name: 'Standard', id: 1},
  chess960: { name: 'Chess960', id: 2},
  fromPosition: { name: 'From position', id: 3},
  kingOfTheHill: { name: 'King of the Hill', id: 4 },
  threeCheck: { name: 'Three-check', id: 5},
  antichess: { name: 'Antichess', id: 6},
  atomic: { name: 'Atomic', id: 7},
  horde: { name: 'Horde', id: 8}
};

export default function getVariant(key) {
  return variantMap[key];
}
