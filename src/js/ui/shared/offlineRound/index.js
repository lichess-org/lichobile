export function gameResult(replayCtrl) {
  let sit = replayCtrl.situation();
  if (sit && sit.finished)
    return sit.turnColor === 'white' ? '0-1' : '1-0';
  else if (sit.stalemate || sit.draw || sit.threefold)
    return '½-½';
  else
    return '?';
}

export function setResult(ctrl, status, winner = null) {
  const sit = ctrl.replay.situation();
  if (status) {
    ctrl.data.game.status = status;
  } else {
    ctrl.data.game.status = { id: 20 };
  }
  ctrl.data.game.winner = winner || sit.winner;
}
