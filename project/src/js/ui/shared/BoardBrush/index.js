import { defs, renderShape } from './svg';
import { brushes } from './brushes';

export default {
  view(vnode) {

    const { bounds, orientation, shapes } = vnode.attrs;

    if (!shapes) return null;
    if (!bounds) return null;
    if (bounds.width !== bounds.height) return null;

    const usedBrushes = Object.keys(brushes)
    .filter(name =>
      shapes.filter(s => s.dest && s.brush === name).length
    ).map(name => brushes[name]);

    return {
      tag: 'svg',
      children: [
        defs(usedBrushes),
        shapes.map(renderShape(orientation, false, brushes, bounds))
      ]
    };
  }
};
