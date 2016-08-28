function firstPly(d) {
  return d.steps[0].ply;
}

function lastPly(d) {
  return d.steps[d.steps.length - 1].ply;
}

function plyStep(d, ply) {
  return d.steps[ply - firstPly(d)];
}

export default {
  merge: function(old, cfg) {
    const data = cfg;

    if (data.game.variant.key === 'horde') {
      data.pref.showCaptured = false;
    }

    const changes = {};

    return {
      data,
      changes
    };
  },
  firstPly,
  lastPly,
  plyStep
};
