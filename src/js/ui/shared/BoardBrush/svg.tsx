import chessground from '../../../chessground';
import { Shape } from '.'
import { Brush } from './brushes'

type BoardPos = [number, number]

interface Bounds {
  width: number
  height: number
}

const key2pos: (key: Pos) => BoardPos = chessground.util.key2pos;

function circleWidth(current: boolean, bounds: Bounds) {
  return (current ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(brush: Brush, current: boolean, bounds: Bounds) {
  return (brush.lineWidth || 10) * (current ? 0.7 : 1) / 512 * bounds.width;
}

function opacity(brush: Brush, current: boolean) {
  return (brush.opacity || 1) * (current ? 0.6 : 1);
}

function arrowMargin(current: boolean, bounds: Bounds) {
  return (current ? 10 : 20) / 512 * bounds.width;
}

function pos2px(pos: BoardPos, bounds: Bounds) {
  const squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

export function circle(brush: Brush, pos: BoardPos, current: boolean, bounds: Bounds) {
  const o = pos2px(pos, bounds);
  const width = circleWidth(current, bounds);
  const radius = bounds.width / 16;
  return (
    <circle
      stroke={brush.color}
      stroke-width={width}
      fill="none"
      opacity={opacity(brush, current)}
      cx={o[0]}
      cy={o[1]}
      r={radius - width / 2 - brush.circleMargin * width * 1.5}
    />
  );
}

export function arrow(brush: Brush, orig: BoardPos, dest: BoardPos, current: boolean, bounds: Bounds) {
  const margin = arrowMargin(current, bounds);
  const a = pos2px(orig, bounds);
  const b = pos2px(dest, bounds);
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx);
  const xo = Math.cos(angle) * margin,
    yo = Math.sin(angle) * margin;

  return (
    <line
      stroke={brush.color}
      stroke-width={lineWidth(brush, current, bounds)}
      stroke-linecap="round"
      marker-end={'url(#arrowhead-' + brush.key + ')'}
      opacity={opacity(brush, current)}
      x1={a[0]}
      y1={a[1]}
      x2={b[0] - xo}
      y2={b[1] - yo}
    />
  );
}

export function piece(theme: string, pos: BoardPos, piece: Piece, bounds: Bounds) {
  const o = pos2px(pos, bounds);
  const size = bounds.width / 8
  let name = piece.color === 'white' ? 'w' : 'b';
  name += (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
  const href = `images/pieces/${theme}/${name}.svg`;
  return {
    tag: 'image',
    attrs: {
      x: o[0] - size / 2,
      y: o[1] - size / 2,
      width: size,
      height: size,
      href: href
    }
  };
}

export function defs(brushes: Brush[]) {
  return (
    <defs>
      {brushes.map(brush => {
        return (
          <marker
            id={'arrowhead-' + brush.key}
            orient="auto"
            markerWidth={4}
            markerHeight={8}
            refX={2.05}
            refY={2.01}
          >
            <path d="M0,0 V4 L3,2 Z" fill={brush.color} />
          </marker>
        );
      })}
    </defs>
  );
}

export function orient(pos: BoardPos, color: Color): [number, number] {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

export function renderShape(
  orientation: Color,
  current: boolean,
  brushes: {[key: string]: Brush},
  bounds: Bounds,
  pieceTheme: string
) {
  return function(shape: Shape) {
    if (shape.piece) return piece(
      pieceTheme,
      orient(key2pos(shape.orig), orientation),
      shape.piece,
      bounds);
    if (shape.orig && shape.dest) return arrow(
      brushes[shape.brush],
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      current, bounds);
    else if (shape.orig) return circle(
      brushes[shape.brush],
      orient(key2pos(shape.orig), orientation),
      current, bounds);
    else return null;
  };
}
