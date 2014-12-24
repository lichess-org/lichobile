var StrongSocket = require('../StrongSocket');


function makeLobbySocket(ctrl) {
  return new StrongSocket(
    '/lobby/socket/v1',
    0, {
      options: { name: 'lobby', pingDelay: 2000 },
      events: {
        redirect: function(data) {
          m.route('/play' + data.url);
        }
      }
    }
  );
}

