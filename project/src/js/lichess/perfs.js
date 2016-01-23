export const perfTypes = [
  ['bullet', 'Bullet', 'Bullet'],
  ['blitz', 'Blitz', 'Blitz'],
  ['classical', 'Classical', 'Classic'],
  ['correspondence', 'Correspondence', 'Corr'],
  ['chess960', 'Chess960', 'Chess960'],
  ['kingOfTheHill', 'King Of The Hill', 'King'],
  ['threeCheck', 'Three-check', '3-check'],
  ['antichess', 'Antichess', 'Antichess'],
  ['atomic', 'Atomic', 'Atomic'],
  ['horde', 'Horde', 'Horde']
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

export function shortPerfTitle(perf) {
  return perfTypes.reduce((prev, curr) => {
    if (curr[0] === perf) return curr[2];
    else return prev;
  }, '');
}

// https://github.com/ornicar/lila/blob/master/modules/rating/src/main/Glicko.scala#L31
export const provisionalDeviation = 110;
