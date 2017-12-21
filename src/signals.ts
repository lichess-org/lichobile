import * as Signal from 'signals'

export default {
  // global screen redraw mechanism; it works the same way as m.redraw() works
  // except it is always async and debounced within an animation frame
  redraw: new Signal(),
  afterLogin: new Signal()
}
