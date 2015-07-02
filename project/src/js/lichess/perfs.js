export const perfTypes = [
  ['bullet', 'Bullet'],
  ['blitz', 'Blitz'],
  ['classical', 'Classical'],
  ['correspondence', 'Correspondence'],
  ['chess960', 'Chess960'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['threeCheck', 'Three-check'],
  ['antichess', 'Antichess'],
  ['atomic', 'Atomic'],
  ['horde', 'Horde']
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

export function perfTitle(perf) {
  return perfTypes.reduce((prev, curr) => {
    if (curr[0] === perf) return curr[1];
    else return prev;
  }, '');
}

// https://github.com/ornicar/lila/blob/master/modules/rating/src/main/Glicko.scala#L31
export const provisionalDeviation = 110;
