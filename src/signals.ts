import Signal from 'signals'

export default {
  // global screen redraw mechanism; it works the same way as m.redraw() works
  // except it is always async and debounced within an animation frame
  redraw: new Signal(),

  // signal sent after successful login
  afterLogin: new Signal(),

  // signal sent after logout, or loosing session
  afterLogout: new Signal(),

  // signal sent after successful restored session from offline database
  sessionRestored: new Signal(),

  // signal fired on websocket pong in homepage
  homePong: new Signal(),
}
