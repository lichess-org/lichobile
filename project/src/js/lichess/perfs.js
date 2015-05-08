const perfTypes = [
  ['bullet', 'Bullet'],
  ['chess960', 'Chess960'],
  ['blitz', 'Blitz'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['classical', 'Classical'],
  ['threeCheck', 'Three-check'],
  ['correspondence', 'Correspondence'],
  ['antichess', 'Antichess'],
  ['atomic', 'Atomic']
];

export default function userPerfs(user) {
  var res = perfTypes.map(function(p) {
    var perf = user.perfs[p[0]];
    if (perf) return {
      key: p[0],
      name: p[1],
      perf
    };
  }).sort(function(a, b) {
    return a.perf.games < b.perf.games;
  });
  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  });

  return res;
}
