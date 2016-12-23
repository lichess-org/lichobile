import * as m from 'mithril';
import { defs, renderShape } from './svg';
import { brushes } from './brushes';

export interface Shape {
  brush: string
  orig: Pos
  dest?: Pos
  piece?: Piece
}

export default function BoardBrush(bounds: ClientRect, orientation: Color, shapes: Shape[], pieceTheme: string) {
  if (!shapes) return null;
  if (!bounds) return null;
  if (bounds.width !== bounds.height) return null;

  const usedBrushes = Object.keys(brushes)
  .filter(name => shapes.filter(s => s.dest && s.brush === name).length)
  .map(name => brushes[name]);

  return m('svg', [
    defs(usedBrushes),
    shapes.map(renderShape(orientation, false, brushes, bounds, pieceTheme))
  ])
}
