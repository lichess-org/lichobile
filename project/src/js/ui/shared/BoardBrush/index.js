import { defs, renderShape } from './svg';
import { brushes } from './brushes';

export default function BoardBrush(bounds, orientation, shapes) {
  if (!shapes) return null;
  if (!bounds) return null;
  if (bounds.width !== bounds.height) return null;

  const usedBrushes = Object.keys(brushes)
  .filter(name => shapes.filter(s => s.dest && s.brush === name).length)
  .map(name => brushes[name]);

  return (
    <svg>
      {defs(usedBrushes)}
      {shapes.map(renderShape(orientation, false, brushes, bounds))}
    </svg>
  );
}
