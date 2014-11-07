var i18n = require('i18n');

module.exports = function(ctrl) {
  switch (ctrl.data.game.status.name) {
    case 'started':
      return i18n('playingRightNow');
    case 'aborted':
      return i18n('gameAborted');
    case 'mate':
      return i18n('checkmate');
    case 'resign':
      return i18n(ctrl.data.game.winner === 'white' ? 'blackResigned' : 'whiteResigned');
    case 'stalemate':
      return i18n('stalemate');
    case 'timeout':
      switch (ctrl.data.game.winner) {
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
      return (ctrl.data.game.winner === 'white' ? 'Black' : 'White') + ' didn\'t move';
    case 'cheat':
      return 'Cheat detected';
    case 'variantEnd':
      switch (ctrl.data.game.variant.key) {
        case 'kingOfTheHill':
          return 'King in the center';
        case 'threeCheck':
          return 'Three checks';
        default:
          return 'Variant ending';
      }
      break;
    default:
      return ctrl.data.game.status.name;
  }
};
