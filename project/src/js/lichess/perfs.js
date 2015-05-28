const perfTypes = [
  ['bullet', 'Bullet'],
  ['blitz', 'Blitz'],
  ['classical', 'Classical'],
  ['correspondence', 'Correspondence'],
  ['chess960', 'Chess960'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['threeCheck', 'Three-check'],
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
  });

  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  });

  return res;
}
