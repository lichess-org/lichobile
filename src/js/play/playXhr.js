var utils = require('../utils');
var settings = require('../settings');

var baseUrl = window.apiEndPoint;

function aiGame() {
  var config = settings.newGame.ai;
  return m.request({
    url: baseUrl + '/setup/ai',
    method: 'POST',
    config: utils.xhrConfig,
    data: {
      variant: config.variant(),
      clock: config.clock(),
      time: config.time(),
      increment: config.increment(),
      level: config.level(),
      color: config.color()
    }
  });
}

function seekHuman() {
  var config = settings.newGame.human;
  var preset = config.timePreset().split('|');
  return m.request({
    url: baseUrl + '/setup/hook/' + utils.lichessSri,
    method: 'POST',
    config: utils.xhrConfig,
    data: {
      variant: config.variant(),
      clock: config.clock(),
      time: preset[0],
      increment: preset[1],
      color: config.color(),
      mode: config.mode()
    },
    deserialize: function(value) { return value; }
  });
}

function game(id) {
  return m.request({
    url: baseUrl + '/' + id,
    method: 'GET',
    config: utils.xhrConfig
  });
}

module.exports = {
  aiGame: aiGame,
  game: game,
  seekHuman: seekHuman
};
