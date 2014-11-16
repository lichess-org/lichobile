var utils = require('../utils');

var baseUrl = window.apiEndPoint;

function aiGame() {
  return m.request({
    url: baseUrl + '/setup/ai',
    method: 'POST',
    config: utils.xhrConfig,
    data: {
      variant: 1,
      clock: true,
      time: 5,
      increment: 3,
      level: 1,
      color: 'white'
    }
  });
}

function seekHuman() {
  return m.request({
    url: baseUrl + '/setup/hook/' + utils.lichessSri,
    method: 'POST',
    config: utils.xhrConfig,
    data: {
      variant: 1,
      clock: true,
      time: 5,
      increment: 3,
      color: 'white',
      mode: '0'
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
