import { request } from '../../http';
import { handleXhrError } from '../../utils';

export function attempt(ctrl, win) {
  return request(`/training/${ctrl.data.puzzle.id}/attempt`, {
    method: 'POST',
    data: {
      win: win ? 1 : 0,
      time: new Date().getTime() - (ctrl.data.startedAt || new Date()).getTime()
    }
  }).then(function(cfg) {
    cfg.progress = ctrl.data.progress;
    ctrl.reload(cfg);
  });
}

export function vote(ctrl, v) {
  return request(`/training/${ctrl.data.puzzle.id}/vote`, {
    method: 'POST',
    data: {
      vote: v
    }
  }).then(function(res) {
    ctrl.data.attempt.vote = res[0];
    ctrl.data.puzzle.vote = res[1];
  });
}

export function retry(ctrl) {
  return request(`/training/${ctrl.data.puzzle.id}`).then(ctrl.reload);
}

export function setDifficulty(ctrl, d) {
  return request('/training/difficulty', {
    method: 'POST',
    data: {
      difficulty: d
    }
  }).then(ctrl.reload).catch(handleXhrError);
}

export function newPuzzle() {
  return request('/training/new');
}
