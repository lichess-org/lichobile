import treePath from './path';

export default function(data) {

  configureSteps(data);

  this.tree = data.steps;

  this.firstPly = function() {
    return this.tree[0].ply;
  }.bind(this);

  this.lastPly = function() {
    return this.tree[this.tree.length - 1].ply;
  }.bind(this);

  this.getStep = function(path) {
    var tree = this.tree;
    for (var j in path) {
      var p = path[j];
      for (var i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          if (p.variation) {
            tree = tree[i].variations[p.variation - 1];
            break;
          }
          return tree[i];
        }
      }
    }
  };

  this.getStepAtPly = function(ply) {
    return this.getStep(treePath.default(ply));
  }.bind(this);

  this.getSteps = function(path) {
    let tree = this.tree;
    const lsteps = [];
    for (var j in path) {
      var p = path[j];
      for (var i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          if (p.variation) {
            tree = tree[i].variations[p.variation - 1];
            break;
          }
          lsteps.push(tree[i]);
          return lsteps;
        } else {
          lsteps.push(tree[i]);
        }
      }
    }
  }.bind(this);

  this.getStepsAfterPly = function(path, ply) {
    if (path[0].ply <= ply) return [];
    return this.getSteps(path).filter(function(step) {
      return step.ply > ply;
    });
  }.bind(this);

  this.getOpening = function(path) {
    var opening;
    this.getSteps(path).forEach(function(s) {
      opening = s.opening || opening;
    });
    return opening;
  }.bind(this);

  this.nextStepEvalBest = function(path) {
    if (!treePath.isRoot(path)) return null;
    const nextPly = path[0].ply + 1;
    const nextStep = this.tree[nextPly - this.firstPly()];
    return (nextStep && nextStep.rEval) ? nextStep.rEval.best : null;
  }.bind(this);

  this.addStep = function(step, path) {
    var nextPath = treePath.withPly(path, treePath.currentPly(path) + 1);
    var tree = this.tree;
    var curStep = null;
    nextPath.forEach(function(p) {
      for (var i = 0, nb = tree.length; i < nb; i++) {
        var s = tree[i];
        if (p.ply === s.ply) {
          if (p.variation) {
            tree = s.variations[p.variation - 1];
            break;
          } else curStep = s;
        } else if (p.ply < s.ply) break;
      }
    });
    if (curStep) {
      curStep.variations = curStep.variations || [];
      if (curStep.san === step.san) return nextPath;
      for (var i = 0; i < curStep.variations.length; i++) {
        if (curStep.variations[i][0].san === step.san)
          return treePath.withVariation(nextPath, i + 1);
      }
      curStep.variations.push([step]);
      return treePath.withVariation(nextPath, curStep.variations.length);
    }
    tree.push(step);
    return nextPath;
  }.bind(this);

  this.addSteps = function(lsteps, path) {
    var step = lsteps[0];
    if (!step) return path;
    var newPath = this.addStep(step, path);
    return this.addSteps(lsteps.slice(1), newPath);
  }.bind(this);

  this.addDests = function(dests, path) {
    return this.updateAtPath(path, function(step) {
      step.dests = dests;
    });
  }.bind(this);

  this.updateAtPath = function(path, update) {
    var tree = this.tree;
    for (var j in path) {
      var p = path[j];
      for (var i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          if (p.variation) {
            tree = tree[i].variations[p.variation - 1];
            break;
          }
          update(tree[i]);
          return;
        }
      }
    }
  }.bind(this);

  this.deleteVariation = function(ply, id) {
    this.updateAtPath(treePath.default(ply), function(node) {
      node.variations.splice(id - 1, 1);
      if (!node.variations.length) delete node.variations;
    });
  }.bind(this);

  this.promoteVariation = function(ply, id) {
    var stepId = ply + this.firstPly();
    var variation = this.getStepAtPly(ply).variations[id - 1];
    this.deleteVariation(ply, id);
    var demoted = this.tree.splice(stepId);
    this.tree = this.tree.concat(variation);
    var lastMainPly = this.tree[stepId];
    lastMainPly.variations = lastMainPly.variations || [];
    lastMainPly.variations.push(demoted);
  }.bind(this);

  this.plyOfNextNag = function(color, nag, fromPly) {
    var len = this.tree.length;
    for (var i = 1; i < len; i++) {
      var ply = (fromPly + i) % len;
      if (this.tree[ply].nag === nag && (ply % 2 === (color === 'white' ? 1 : 0))) return ply;
    }
  }.bind(this);
}

function configureSteps(data) {
  const steps = data.steps;
  const analysis = data.analysis;
  for (var i = 0, len = steps.length; i < len; i++) {
    const s = steps[i];
    s.fixed = true;
    if (analysis) {
      const move = i - 1 >= 0 ? analysis.moves[i - 1] : null;
      if (move) {
        s.rEval = {
          cp: move.eval,
          best: move.best,
          mate: move.mate,
          variation: move.variation,
          judgment: move.judgment
        };
      }
    }
  }
}
