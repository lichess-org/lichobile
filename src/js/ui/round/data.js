module.exports = function(data) {

  if (data.clock) {
    data.clock.showTenths = data.pref.clockTenths;
    data.clock.showBar = data.pref.clockBar;
  }

  if (data.game.moves) data.game.moves = data.game.moves.split(' ');
  else data.game.moves = [];

  return data;
};
