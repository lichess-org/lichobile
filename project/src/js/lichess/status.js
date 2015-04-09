// https://github.com/ornicar/scalachess/blob/master/src/main/scala/Status.scala

var i18n = require('../i18n');

var ids = {
  created: 10,
  started: 20,
  aborted: 25,
  mate: 30,
  resign: 31,
  stalemate: 32,
  timeout: 33,
  draw: 34,
  outoftime: 35,
  cheat: 36,
  noStart: 37,
  variantEnd: 60
};

function started(data) {
  return data.game.status.id >= ids.started;
}

function finished(data) {
  return data.game.status.id >= ids.mate;
}

function aborted(data) {
  return data.game.status.id === ids.aborted;
}

function toLabel(data) {
  switch (data.game.status.name) {
    case 'started':
      return i18n('playingRightNow');
    case 'aborted':
      return i18n('gameAborted');
    case 'mate':
      return i18n('checkmate');
    case 'resign':
      return i18n(data.game.winner === 'white' ? 'blackResigned' : 'whiteResigned');
    case 'stalemate':
      return i18n('stalemate');
    case 'timeout':
      switch (data.game.winner) {
        case 'white':
          return i18n('blackLeftTheGame');
        case 'black':
          return i18n('whiteLeftTheGame');
        default:
          return i18n('draw');
      }
      break;
    case 'draw':
      return i18n('draw');
    case 'outoftime':
      return i18n('timeOut');
    case 'noStart':
      return (data.game.winner === 'white' ? 'Black' : 'White') + ' didn\'t move';
    case 'cheat':
      return 'Cheat detected';
    case 'variantEnd':
      switch (data.game.variant.key) {
        case 'kingOfTheHill':
          return 'King in the center';
        case 'threeCheck':
          return 'Three checks';
        default:
          return 'Variant ending';
      }
      break;
    default:
      return data.game.status.name;
  }
}

module.exports = {
  ids: ids,
  started: started,
  finished: finished,
  aborted: aborted,
  toLabel: toLabel
};
