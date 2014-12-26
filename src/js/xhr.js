var utils = require('./utils');
var http = require('./http');
var settings = require('./settings');

function newAiGame() {
  var config = settings.newGame.ai;
  return http.request('/setup/ai', {
    method: 'POST',
    data: {
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      level: config.level(),
      color: config.color()
    }
  });
}

function seekGame() {
  var config = settings.newGame.human;
  var preset = config.timePreset().split('+');
  return http.request('/setup/hook/' + utils.lichessSri, {
    method: 'POST',
    data: {
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: preset[0],
      increment: preset[1],
      color: config.color(),
      mode: config.mode()
    },
    deserialize: function(value) { return value; }
  });
}

function game(id) {
  return http.request('/' + id);
}

module.exports = {
  newAiGame: newAiGame,
  seekGame: seekGame,
  game: game
};
