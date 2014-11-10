var m = require('mithril');
var utils = require('../utils');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

var baseUrl = window.apiEndPoint;

function aiGame() {
  return m.request({
    url: baseUrl + '/setup/ai',
    method: 'POST',
    config: xhrConfig,
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
    config: xhrConfig,
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
    config: xhrConfig
  });
}

module.exports = {
  aiGame: aiGame,
  game: game,
  seekHuman: seekHuman
};
