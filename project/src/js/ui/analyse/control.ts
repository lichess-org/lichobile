import path from './path';
import { empty } from './util';
import { AnalyseCtrlInterface, PathObj } from './interfaces';

function canGoForward(ctrl: AnalyseCtrlInterface) {
  let tree = ctrl.analyse.tree;
  let ok = false;
  ctrl.vm.path.forEach((step: PathObj) => {
    for (let i = 0, nb = tree.length; i < nb; i++) {
      const move = tree[i];
      if (step.ply === move.ply && step.variation) {
        tree = move.variations[step.variation - 1];
        break;
      } else ok = step.ply < move.ply;
    }
  });
  return ok;
}

function canEnterVariation(ctrl: AnalyseCtrlInterface) {
  let tree = ctrl.analyse.tree;
  let ok = false;
  ctrl.vm.path.forEach((step: PathObj) => {
    for (let i = 0, nb = tree.length; i < nb; i++) {
      const move = tree[i];
      if (step.ply === move.ply) {
        if (step.variation) {
          tree = move.variations[step.variation - 1];
          break;
        } else ok = !empty(move.variations);
      }
    }
  });
  return ok;
}

export default {

  canGoForward: canGoForward,

  next: function(ctrl: AnalyseCtrlInterface) {
    if (!canGoForward(ctrl)) return false;
    const p = ctrl.vm.path;
    p[p.length - 1].ply++;
    ctrl.userJump(p, 'forward');

    return true;
  },

  prev: function(ctrl: AnalyseCtrlInterface) {
    const p = ctrl.vm.path;
    const len = p.length;
    if (len === 1) {
      if (p[0].ply === ctrl.analyse.firstPly()) return false;
      p[0].ply--;
    } else {
      if (p[len - 1].ply > p[len - 2].ply) p[len - 1].ply--;
      else {
        p.pop();
        p[len - 2].variation = null;
        if (p[len - 2].ply > 1) p[len - 2].ply--;
      }
    }
    ctrl.userJump(p);

    return true;
  },

  last: function(ctrl: AnalyseCtrlInterface) {
    ctrl.userJump([{
      ply: ctrl.analyse.tree[ctrl.analyse.tree.length - 1].ply,
      variation: null
    }], 'forward');
  },

  first: function(ctrl: AnalyseCtrlInterface) {
    ctrl.userJump([{
      ply: ctrl.analyse.firstPly(),
      variation: null
    }]);
  },

  enterVariation: function(ctrl: AnalyseCtrlInterface) {
    if (canEnterVariation(ctrl))
      ctrl.userJump(path.withVariation(ctrl.vm.path, 1));
  },

  exitVariation: function(ctrl: AnalyseCtrlInterface) {
    const p = ctrl.vm.path;
    if (p.length > 1)
      ctrl.userJump(path.withoutVariation(p));
  }
};
