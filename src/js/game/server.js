'use strict';

var m = require('mithril');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

module.exports = {

  aiGame: function() {
    return m.request({
      url: window.apiEndPoint + '/setup/ai',
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
  },

  game: function(id) {
    return m.request({
      url: window.apiEndPoint + id,
      method: 'GET',
      config: xhrConfig
    });
  }
};
