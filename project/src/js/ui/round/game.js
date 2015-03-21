var gameStatus = require('./status');

function parsePossibleMoves(possibleMoves) {
  if (!possibleMoves) return {};
  var r = {};
  var keys = Object.keys(possibleMoves);
  for (var i = 0, ilen = keys.length; i < ilen; i++) {
    var m = possibleMoves[keys[i]];
    var a = [];
    for (var j = 0, jlen = m.length; j < jlen; j += 2) {
      a.push(m.substr(j, 2));
    }
    r[keys[i]] = a;
  }
  return r;
}

function playable(data) {
  return data.game.status.id < gameStatus.ids.aborted;
}

function isPlayerPlaying(data) {
  return playable(data) && !data.player.spectator;
}

function isPlayerTurn(data) {
  return isPlayerPlaying(data) && data.game.player === data.player.color;
}

function mandatory(data) {
  return !!data.tournament;
}

function playedTurns(data) {
  return data.game.turns - data.game.startedAtTurn;
}

function abortable(data) {
  return playable(data) && playedTurns(data) < 2 && !mandatory(data);
}

function takebackable(data) {
  return playable(data) && data.takebackable && !data.tournament && playedTurns(data) > 1 && !data.player.proposingTakeback && !data.opponent.proposingTakeback;
}

function drawable(data) {
  return playable(data) && data.game.turns >= 2 && !data.player.offeringDraw && !data.opponent.ai && !data.opponent.offeringDraw;
}

function resignable(data) {
  return playable(data) && !abortable(data);
}

function forceResignable(data) {
  return !data.opponent.ai && data.clock && data.opponent.isGone && resignable(data);
}

function moretimeable(data) {
  return data.clock && isPlayerPlaying(data) && !mandatory(data);
}

function replayable(data) {
  return data.source === 'import' || gameStatus.finished(data);
}

function getPlayer(data, color) {
  if (data.player.color === color) return data.player;
  if (data.opponent.color === color) return data.opponent;
  return null;
}

function setIsGone(data, color, isGone) {
  var player = getPlayer(data, color);
  isGone = isGone && !player.ai;
  player.isGone = isGone;
  if (!isGone && player.user) player.user.online = true;
}

function setOnGame(data, color, onGame) {
  var player = getPlayer(data, color);
  onGame = onGame || player.ai;
  player.onGame = onGame;
  if (onGame) setIsGone(data, color, false);
}

function nbMoves(data, color) {
  return Math.floor((data.game.turns + (color === 'white' ? 1 : 0)) / 2);
}

function result(data) {
  if (gameStatus.finished(data)) switch (data.game.winner) {
    case 'white':
      return '1-0';
      break;
    case 'black':
      return '0-1';
      break;
    default:
      return '½-½';
  }
  return '*';
}

module.exports = {
  isPlayerPlaying: isPlayerPlaying,
  isPlayerTurn: isPlayerTurn,
  playable: playable,
  abortable: abortable,
  takebackable: takebackable,
  drawable: drawable,
  resignable: resignable,
  forceResignable: forceResignable,
  moretimeable: moretimeable,
  mandatory: mandatory,
  replayable: replayable,
  getPlayer: getPlayer,
  parsePossibleMoves: parsePossibleMoves,
  nbMoves: nbMoves,
  setOnGame: setOnGame,
  setIsGone: setIsGone,
  result: result
};
