import h from 'mithril/hyperscript'
import { Glyph } from '../tree/interfaces'
import { defs, makeShapeRenderer } from './svg'
import { brushes } from './brushes'

export interface Shape {
  orig: Key
  brush?: string
  dest?: Key
  piece?: Piece
  glyph?: Glyph
}

const usedBrushes = defs(Object.keys(brushes).map(name => brushes[name]))

export default function BoardBrush(
  bounds: ClientRect,
  orientation: Color,
  shapes: ReadonlyArray<Shape>,
  pieceTheme: string
): Mithril.Child {
  if (!shapes) return null
  if (!bounds) return null
  if (bounds.width !== bounds.height) return null

  const shapeRenderer =
    makeShapeRenderer(orientation, false, brushes, bounds, pieceTheme)

  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
  }, [
    usedBrushes,
    shapes.map(shapeRenderer)
  ])
}
