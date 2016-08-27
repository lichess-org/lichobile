import gameStatus from './status';
import { secondsToMinutes } from '../utils';
import settings from '../settings';
import i18n from '../i18n';

const analysableVariants = ['standard', 'chess960', 'fromPosition', 'kingOfTheHill', 'threeCheck', 'crazyhouse', 'atomic', 'horde', 'racingKings'];

function parsePossibleMoves(possibleMoves: StringMap): {[index: string]: Array<Pos>} {
  if (!possibleMoves) return {};
  const r: {[index: string]: Array<Pos>} = {};
  const keys = Object.keys(possibleMoves);
  for (let i = 0, ilen = keys.length; i < ilen; i++) {
    const mvs = possibleMoves[keys[i]];
    const a: Array<Pos> = [];
    for (let j = 0, jlen = mvs.length; j < jlen; j += 2) {
      a.push(<Pos>mvs.substr(j, 2));
    }
    r[keys[i]] = a;
  }
  return r;
}

function playable(data: GameData) {
  return data.game.status.id < gameStatus.ids.aborted;
}

function isPlayerPlaying(data: GameData) {
  return playable(data) && !data.player.spectator;
}

function isPlayerTurn(data: GameData) {
  return isPlayerPlaying(data) && data.game.player === data.player.color;
}

function isOpponentTurn(data: GameData) {
  return isPlayerPlaying(data) && data.game.player !== data.player.color;
}

function mandatory(data: GameData) {
  return !!data.tournament;
}

function playedTurns(data: GameData) {
  return data.game.turns - data.game.startedAtTurn;
}

function abortable(data: GameData) {
  return playable(data) && playedTurns(data) < 2 && !mandatory(data);
}

function takebackable(data: GameData) {
  return playable(data) && data.takebackable && !data.tournament && playedTurns(data) > 1 && !data.player.proposingTakeback && !data.opponent.proposingTakeback;
}

function drawable(data: GameData) {
  return playable(data) && data.game.turns >= 2 && !data.player.offeringDraw && !data.opponent.ai && !data.opponent.offeringDraw;
}

function berserkableBy(data: GameData) {
  return data.tournament &&
    data.tournament.berserkable &&
    isPlayerPlaying(data) &&
    playedTurns(data) < 2;
}

function resignable(data: GameData) {
  return playable(data) && !abortable(data);
}

function forceResignable(data: GameData) {
  return !data.opponent.ai && data.clock && data.opponent.isGone && resignable(data);
}

function moretimeable(data: GameData) {
  return data.clock && isPlayerPlaying(data) && !mandatory(data);
}

function imported(data: GameData) {
  return data.game.source === 'import';
}

function replayable(data: GameData) {
  return imported(data) || gameStatus.finished(data);
}

function userAnalysable(data: GameData) {
  return settings.analyse.supportedVariants.indexOf(data.game.variant.key) !== -1 && playable(data) && (!data.clock || !isPlayerPlaying(data));
}

function analysable(data: GameData) {
  return replayable(data) && playedTurns(data) > 4 && analysableVariants.indexOf(data.game.variant.key) !== -1;
}

function getPlayer(data: GameData, color: Color) {
  if (data.player.color === color) return data.player;
  if (data.opponent.color === color) return data.opponent;
  return null;
}

function setIsGone(data: GameData, color: Color, isGone: boolean) {
  const player = getPlayer(data, color);
  isGone = isGone && !player.ai;
  player.isGone = isGone;
  if (!isGone && player.user) player.user.online = true;
}

function setOnGame(data: GameData, color: Color, onGame: boolean) {
  const player = getPlayer(data, color);
  onGame = onGame || !!player.ai;
  player.onGame = onGame;
  if (onGame) setIsGone(data, color, false);
}

function nbMoves(data: GameData, color: Color) {
  return Math.floor((data.game.turns + (color === 'white' ? 1 : 0)) / 2);
}

function result(data: GameData) {
  if (gameStatus.finished(data)) switch (data.game.winner) {
    case 'white':
      return '1-0';
    case 'black':
      return '0-1';
    default:
      return '½-½';
  }
  return '*';
}

function time(data: GameData) {
  if (data.clock) {
    const min = secondsToMinutes(data.clock.initial);
    const t = min === 0.5 ? '½' : min === 0.75 ? '¾' : min.toString();
    return t + '+' + data.clock.increment;
  }
  else if (data.correspondence) {
    return i18n('nbDays', data.correspondence.daysPerTurn);
  }
  else {
    return '∞';
  }
}

function publicUrl(data: GameData) {
  return 'http://lichess.org/' + data.game.id;
}

function isSupportedVariant(data: GameData) {
  return settings.game.supportedVariants.indexOf(data.game.variant.key) !== -1;
}

export default {
  analysableVariants,
  isPlayerPlaying,
  isPlayerTurn,
  isOpponentTurn,
  playable,
  abortable,
  takebackable,
  drawable,
  berserkableBy,
  resignable,
  forceResignable,
  moretimeable,
  mandatory,
  replayable,
  userAnalysable,
  analysable,
  getPlayer,
  parsePossibleMoves,
  nbMoves,
  setOnGame,
  setIsGone,
  result,
  time,
  publicUrl,
  isSupportedVariant
};
