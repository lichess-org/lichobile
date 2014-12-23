var Signal = require('signals');

module.exports = {
  // socket events
  connected: new Signal(),
  disconnected: new Signal()
};
