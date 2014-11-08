var m = require('mithril');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

var baseUrl = window.apiEndPoint;

function aiGame () {
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

function game (id) {
  return m.request({
    url: baseUrl + id,
    method: 'GET',
    config: xhrConfig
  });
}

module.exports = {
  aiGame: aiGame,
  game: game
};
