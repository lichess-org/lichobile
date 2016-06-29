import gameApi from '../../../lichess/game';

export default {
  drop: function(chessground, data, role, key) {

    if (!gameApi.isPlayerTurn(data)) return false;

    if (role === 'pawn' && (key[1] === '1' || key[1] === '8')) return false;

    const dropStr = data.possibleDrops;

    if (dropStr === undefined || dropStr === null) return true;

    const drops = dropStr.match(/.{2}/g) || [];

    return drops.indexOf(key) !== -1;
  }
};
