'use strict';

var ajax = require('../ajax');

module.exports = {

  aiGame: function() {
    return ajax({ url: '/setup/ai', method: 'POST', data: {
      variant: '1',
      clock: true,
      time: 5,
      increment: 3,
      level: 1,
      color: 'white'
    }});
  },

  game: function (id) {
    return ajax({ url: id, method: 'GET'});
  }
};
