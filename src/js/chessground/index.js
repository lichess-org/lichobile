import * as m from 'mithril'
import controller from './ctrl'
import view from './view'
import fen from './fen'
import util from './util'
import configure from './configure'
import anim from './anim'
import board from './board'
import drag from './drag'

export default {
  render(element, ctrl) {
    m.render(element, [view(ctrl)])
  },
  controller,
  view,
  fen,
  util,
  configure,
  anim,
  board,
  drag
}
