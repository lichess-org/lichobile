import { request } from '../../http';
import { handleXhrError } from '../../utils';

function attempt(ctrl, win) {
  request({
    method: 'POST',
    url: ctrl.router.Puzzle.attempt(ctrl.data.puzzle.id).url,
    data: {
      win: win ? 1 : 0,
      time: new Date().getTime() - (ctrl.data.startedAt || new Date()).getTime()
    }
  }).then(function(cfg) {
    cfg.progress = ctrl.data.progress;
    ctrl.reload(cfg);
  });
}

function vote(ctrl, v) {
  request({
    method: 'POST',
    url: ctrl.router.Puzzle.vote(ctrl.data.puzzle.id).url,
    data: {
      vote: v
    }
  }).then(function(res) {
    ctrl.data.attempt.vote = res[0];
    ctrl.data.puzzle.vote = res[1];
  });
}

function retry(ctrl) {
  request({
    method: 'GET',
    url: uncache(ctrl.router.Puzzle.load(ctrl.data.puzzle.id).url)
  }).then(ctrl.reload);
}

function setDifficulty(ctrl, d) {
  request('/training/difficulty', {
    method: 'POST',
    data: {
      difficulty: d
    }
  }).then(ctrl.reload).catch(handleXhrError);
}

function newPuzzle(ctrl) {
  request('/training/new').then(function(cfg) {
    ctrl.reload(cfg);
    ctrl.pushState(cfg);
  }).catch(handleXhrError);
}

module.exports = {
  attempt: attempt,
  vote: vote,
  retry: retry,
  setDifficulty: setDifficulty,
  newPuzzle: newPuzzle
};
