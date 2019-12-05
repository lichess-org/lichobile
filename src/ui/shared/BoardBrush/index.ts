import h from 'mithril/hyperscript'
import { defs, renderShape } from './svg'
import { brushes } from './brushes'

export interface Shape {
  brush: string
  orig: Key
  dest?: Key
  piece?: Piece
}

const usedBrushes = defs(Object.keys(brushes).map(name => brushes[name]))

export default function BoardBrush(
  bounds: ClientRect,
  orientation: Color,
  shapes: ReadonlyArray<Shape>,
  pieceTheme: string
) {
  if (!shapes) return null
  if (!bounds) return null
  if (bounds.width !== bounds.height) return null

  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
  }, [
    usedBrushes,
    shapes.map(renderShape(orientation, false, brushes, bounds, pieceTheme))
  ])
}
