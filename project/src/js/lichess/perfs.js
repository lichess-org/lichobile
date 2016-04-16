export const perfTypes = [
  ['bullet', 'Bullet', 'Bullet'],
  ['blitz', 'Blitz', 'Blitz'],
  ['classical', 'Classical', 'Classic'],
  ['correspondence', 'Correspondence', 'Corresp.'],
  ['chess960', 'Chess960', '960'],
  ['kingOfTheHill', 'King Of The Hill', 'KotH'],
  ['threeCheck', 'Three-check', '3check'],
  ['antichess', 'Antichess', 'Antichess'],
  ['atomic', 'Atomic', 'Atomic'],
  ['horde', 'Horde', 'Horde'],
  ['racingKings', 'Racing Kings', 'Racing']
];

export default function userPerfs(user) {
  var res = perfTypes.map(p => {
    var perf = user.perfs[p[0]];
    return {
      key: p[0],
      name: p[1],
      perf: perf || '-'
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
