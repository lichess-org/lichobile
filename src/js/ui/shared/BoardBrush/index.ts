import * as h from 'mithril/hyperscript';
import { defs, renderShape } from './svg';
import { brushes } from './brushes';

export interface Shape {
  orig: Pos
  dest?: Pos
  piece?: Piece
  brush?: string
}

const usedBrushes = defs(Object.keys(brushes).map(name => brushes[name]))

export default function BoardBrush(bounds: ClientRect, orientation: Color, shapes: Shape[], pieceTheme: string) {
  if (!shapes) return null;
  if (!bounds) return null;
  if (bounds.width !== bounds.height) return null;

  return h('svg', [
    usedBrushes,
    shapes.map(renderShape(orientation, false, brushes, bounds, pieceTheme))
  ])
}
