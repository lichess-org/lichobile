import Signal from 'signals';

export default {
  // global screen redraw mechanism; it works the same way as m.redraw() works
  // except it is always async and debounced within an animation frame
  redraw: new Signal(),

  // dispatched when a user cancels a seek; we need this to close the lobby
  // socket that is used to seek a game, and recreate the previous socket
  // connection whatever it was
  // this is a workaround because we currently only one socket can be opened at
  // a time
  seekCanceled: new Signal()
};
