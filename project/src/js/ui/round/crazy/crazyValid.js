import gameApi from '../../../lichess/game';

export default {
  drop: function(chessground, data, role, key, possibleDrops) {

    if (!data.game.offline && !gameApi.isPlayerTurn(data)) return false;

    if (role === 'pawn' && (key[1] === '1' || key[1] === '8')) return false;

    if (possibleDrops === undefined || possibleDrops === null) return true;

    const drops = Array.isArray(possibleDrops) ?
      possibleDrops : possibleDrops.match(/.{2}/g) || [];

    return drops.indexOf(key) !== -1;
  }
};
