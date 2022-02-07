import h from 'mithril/hyperscript'
import * as cgUtil from '../../../chessground/util'
import { Glyph } from '../tree/interfaces'
import { Shape } from '.'
import { Brush } from './brushes'

type BoardPos = [number, number]

const key2pos: (key: Key) => BoardPos = cgUtil.key2pos

function circleWidth(current: boolean, bounds: ClientRect) {
  return (current ? 3 : 4) / 512 * bounds.width
}

function lineWidth(brush: Brush, current: boolean, bounds: ClientRect) {
  return (brush.lineWidth || 10) * (current ? 0.7 : 1) / 512 * bounds.width
}

function opacity(brush: Brush, current: boolean) {
  return (brush.opacity || 1) * (current ? 0.6 : 1)
}

function arrowMargin(current: boolean, bounds: ClientRect) {
  return (current ? 10 : 20) / 512 * bounds.width
}

function pos2px(pos: BoardPos, bounds: ClientRect) {
  const squareSize = bounds.width / 8
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize]
}

export function circle(brush: Brush, pos: BoardPos, current: boolean, bounds: ClientRect) {
  const o = pos2px(pos, bounds)
  const width = circleWidth(current, bounds)
  const radius = bounds.width / 16
  return (
    <circle
      stroke={brush.color}
      stroke-width={width}
      fill="none"
      opacity={opacity(brush, current)}
      cx={o[0]}
      cy={o[1]}
      r={radius - width / 2}
    />
  )
}

export function arrow(brush: Brush, orig: BoardPos, dest: BoardPos, current: boolean, bounds: ClientRect) {
  const margin = arrowMargin(current, bounds)
  const a = pos2px(orig, bounds)
  const b = pos2px(dest, bounds)
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx)
  const xo = Math.cos(angle) * margin,
    yo = Math.sin(angle) * margin

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
  )
}

export function piece(theme: string, pos: BoardPos, piece: Piece, bounds: ClientRect) {
  const o = pos2px(pos, bounds)
  const size = bounds.width / 8
  let name = piece.color === 'white' ? 'w' : 'b'
  name += (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase()
  const href = `images/pieces/${theme}/${name}.svg`
  return h('image', {
    x: o[0] - size / 2,
    y: o[1] - size / 2,
    width: size,
    height: size,
    'xlink:href': href,
  })
}

export function annotation(pos: BoardPos, glyph: Glyph, bounds: ClientRect) {
  const o = pos2px(pos, bounds)
  const size = bounds.width / 8
  const x = o[0] - size / 2
  const y = o[1] - size / 2
  const svg = glyphToSvg[glyph.symbol]
  if (svg) {
    return (
      <g transform={`translate(${x},${y})`}>
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {svg}
        </svg>
      </g>
    )
  }
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
        )
      })}
      <filter id="shadow">
        <feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" />
      </filter>
    </defs>
  )
}

export function orient(pos: BoardPos, color: Color): [number, number] {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]]
}

export function makeShapeRenderer(
  orientation: Color,
  current: boolean,
  brushes: {[key: string]: Brush},
  bounds: ClientRect,
  pieceTheme: string
) {
  return (shape: Shape) => {
    if (shape.piece) return piece(
      pieceTheme,
      orient(key2pos(shape.orig), orientation),
      shape.piece,
      bounds)
    if (shape.glyph) return annotation(
      orient(key2pos(shape.orig), orientation),
      shape.glyph,
      bounds)
    const brush = shape.brush && brushes[shape.brush]
    if (brush && shape.orig && shape.dest) return arrow(
      brush,
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      current, bounds)
    else if (brush && shape.orig) return circle(
      brush,
      orient(key2pos(shape.orig), orientation),
      current, bounds)
    else return null
  }
}

// taken from https://github.com/lichess-org/lila/blob/master/ui/analyse/src/autoShape.ts
// adapted to lichobile
const glyphToSvg: {[k: string]: Mithril.Child} = {
  // Inaccuracy
  '?!': (
    <g transform="translate(77 -18) scale(0.4)">
      <circle style="fill:#56b4e9;filter:url(#shadow)" cx="50" cy="50" r="50" />
      <path style="fill:#ffffff;stroke-width:0.81934" d="m 37.734375,21.947266 c -3.714341,0 -7.128696,0.463992 -10.242187,1.392578 -3.113493,0.928585 -6.009037,2.130656 -8.685547,3.605468 l 4.34375,8.765626 c 2.348774,-1.201699 4.643283,-2.157093 6.882812,-2.867188 2.239529,-0.710095 4.504676,-1.064453 6.798828,-1.064453 2.294152,0 4.069851,0.463993 5.326172,1.392578 1.310944,0.873963 1.966797,2.185668 1.966797,3.933594 0,1.747925 -0.546219,3.276946 -1.638672,4.58789 -1.037831,1.256322 -2.786121,2.757934 -5.24414,4.50586 -2.785757,2.021038 -4.751362,3.961188 -5.898438,5.818359 -1.147076,1.857171 -1.720703,4.149726 -1.720703,6.88086 v 2.951171 h 10.568359 v -2.376953 c 0,-1.147076 0.137043,-2.10247 0.410156,-2.867187 0.327737,-0.764718 0.928772,-1.557613 1.802735,-2.376953 0.873963,-0.81934 2.103443,-1.802143 3.6875,-2.949219 2.130284,-1.584057 3.905982,-3.058262 5.326172,-4.423828 1.420189,-1.42019 2.485218,-2.951164 3.195312,-4.589844 0.710095,-1.63868 1.064453,-3.576877 1.064453,-5.816406 0,-4.205946 -1.583838,-7.675117 -4.751953,-10.40625 -3.113492,-2.731134 -7.510649,-4.095703 -13.191406,-4.095703 z m 24.744141,0.818359 2.048828,39.083984 h 9.75 L 76.324219,22.765625 Z M 35.357422,68.730469 c -1.966416,0 -3.63248,0.51881 -4.998047,1.55664 -1.365567,0.983208 -2.046875,2.731498 -2.046875,5.244141 0,2.403397 0.681308,4.151687 2.046875,5.244141 1.365567,1.03783 3.031631,1.55664 4.998047,1.55664 1.911793,0 3.550449,-0.51881 4.916016,-1.55664 1.365566,-1.092454 2.048828,-2.840744 2.048828,-5.244141 0,-2.512643 -0.683262,-4.260933 -2.048828,-5.244141 -1.365567,-1.03783 -3.004223,-1.55664 -4.916016,-1.55664 z m 34.003906,0 c -1.966416,0 -3.63248,0.51881 -4.998047,1.55664 -1.365566,0.983208 -2.048828,2.731498 -2.048828,5.244141 0,2.403397 0.683262,4.151687 2.048828,5.244141 1.365567,1.03783 3.031631,1.55664 4.998047,1.55664 1.911793,0 3.550449,-0.51881 4.916016,-1.55664 1.365566,-1.092454 2.046875,-2.840744 2.046875,-5.244141 0,-2.512643 -0.681309,-4.260933 -2.046875,-5.244141 -1.365567,-1.03783 -3.004223,-1.55664 -4.916016,-1.55664 z" />
    </g>
  ),

  // Mistake
  '?': (
    <g transform="translate(77 -18) scale(0.4)">
      <circle style="fill:#e69f00;filter:url(#shadow)" cx="50" cy="50" r="50" />
      <path style="fill:#ffffff;stroke-width:0.932208" d="m 40.435856,60.851495 q 0,-4.661041 1.957637,-7.830548 1.957637,-3.169507 6.711897,-6.618677 4.194937,-2.983065 5.966132,-5.127144 1.864416,-2.237299 1.864416,-5.220365 0,-2.983065 -2.237299,-4.474598 -2.144079,-1.584754 -6.059353,-1.584754 -3.915273,0 -7.737326,1.21187 -3.822053,1.211871 -7.830548,3.262729 L 28.13071,24.495382 q 4.567819,-2.516962 9.881405,-4.101716 5.313586,-1.584753 11.6526,-1.584753 9.694964,0 15.008549,4.66104 5.406807,4.66104 5.406807,11.839042 0,3.822053 -1.21187,6.618677 -1.211871,2.796624 -3.635612,5.220365 -2.423741,2.33052 -6.059352,5.033923 -2.703403,1.957637 -4.194936,3.355949 -1.491533,1.398312 -2.050858,2.703403 -0.466104,1.305091 -0.466104,3.262728 v 2.703403 H 40.435856 Z m -1.491533,18.923822 q 0,-4.288156 2.33052,-5.966131 2.33052,-1.771195 5.686469,-1.771195 3.262728,0 5.593248,1.771195 2.33052,1.677975 2.33052,5.966131 0,4.101716 -2.33052,5.966132 -2.33052,1.771195 -5.593248,1.771195 -3.355949,0 -5.686469,-1.771195 -2.33052,-1.864416 -2.33052,-5.966132 z" />
    </g>
  ),

  // Blunder
  '??': (
    <g transform="translate(77 -18) scale(0.4)">
      <circle style="fill:#df5353;filter:url(#shadow)" cx="50" cy="50" r="50" />
      <path style="fill:#ffffff;stroke-width:0.810558" d="m 31.799294,22.220598 c -3.67453,-10e-7 -7.050841,0.460303 -10.130961,1.378935 -3.08012,0.918633 -5.945403,2.106934 -8.593226,3.565938 l 4.297618,8.67363 c 2.3236,-1.188818 4.592722,-2.135794 6.808247,-2.838277 2.215525,-0.702483 4.45828,-1.053299 6.727842,-1.053299 2.269562,0 4.025646,0.460305 5.268502,1.378937 1.296893,0.864596 1.945788,2.160375 1.945788,3.889565 0,1.72919 -0.541416,3.241939 -1.62216,4.538831 -1.026707,1.242856 -2.756423,2.729237 -5.188097,4.458428 -2.755898,1.999376 -4.700572,3.917682 -5.835354,5.754947 -1.13478,1.837266 -1.702564,4.106388 -1.702564,6.808248 v 2.918681 h 10.4566 v -2.34982 c 0,-1.134781 0.135856,-2.081756 0.406042,-2.838277 0.324222,-0.756521 0.918373,-1.539262 1.782969,-2.349819 0.864595,-0.810559 2.079262,-1.783901 3.646342,-2.918683 2.10745,-1.567078 3.863533,-3.025082 5.268501,-4.376012 1.404967,-1.404967 2.459422,-2.919725 3.161905,-4.540841 0.702483,-1.621116 1.053298,-3.539423 1.053298,-5.754948 0,-4.160865 -1.567492,-7.591921 -4.70165,-10.29378 -3.080121,-2.70186 -7.429774,-4.052384 -13.049642,-4.052384 z m 38.66449,0 c -3.67453,-10e-7 -7.05285,0.460303 -10.132971,1.378935 -3.08012,0.918633 -5.943393,2.106934 -8.591215,3.565938 l 4.295608,8.67363 c 2.323599,-1.188818 4.592721,-2.135794 6.808246,-2.838277 2.215526,-0.702483 4.458281,-1.053299 6.727842,-1.053299 2.269563,0 4.025647,0.460305 5.268502,1.378937 1.296893,0.864596 1.945788,2.160375 1.945788,3.889565 0,1.72919 -0.539406,3.241939 -1.62015,4.538831 -1.026707,1.242856 -2.756423,2.729237 -5.188097,4.458428 -2.755897,1.999376 -4.700572,3.917682 -5.835353,5.754947 -1.134782,1.837266 -1.702564,4.106388 -1.702564,6.808248 v 2.918681 h 10.456599 v -2.34982 c 0,-1.134781 0.133846,-2.081756 0.404032,-2.838277 0.324223,-0.756521 0.918374,-1.539262 1.782969,-2.349819 0.864596,-0.810559 2.081273,-1.783901 3.648352,-2.918683 2.107451,-1.567078 3.863534,-3.025082 5.268502,-4.376012 1.404966,-1.404967 2.45942,-2.919725 3.161904,-4.540841 0.702483,-1.621116 1.053299,-3.539423 1.053299,-5.754948 0,-4.160865 -1.567493,-7.591921 -4.701651,-10.29378 -3.08012,-2.70186 -7.429774,-4.052384 -13.049642,-4.052384 z M 29.449473,68.50341 c -1.945339,0 -3.593943,0.513038 -4.944873,1.539744 -1.350931,0.97267 -2.026192,2.702386 -2.026192,5.188098 0,2.377636 0.675261,4.107352 2.026192,5.188097 1.35093,1.026707 2.999534,1.539745 4.944873,1.539745 1.891302,0 3.51153,-0.513038 4.86246,-1.539745 1.35093,-1.080745 2.026192,-2.810461 2.026192,-5.188097 0,-2.485712 -0.675262,-4.215428 -2.026192,-5.188098 -1.35093,-1.026706 -2.971158,-1.539744 -4.86246,-1.539744 z m 38.662481,0 c -1.945339,0 -3.591933,0.513038 -4.942864,1.539744 -1.35093,0.97267 -2.026192,2.702386 -2.026192,5.188098 0,2.377636 0.675262,4.107352 2.026192,5.188097 1.350931,1.026707 2.997525,1.539745 4.942864,1.539745 1.891302,0 3.513539,-0.513038 4.864469,-1.539745 1.350931,-1.080745 2.026192,-2.810461 2.026192,-5.188097 0,-2.485712 -0.675261,-4.215428 -2.026192,-5.188098 -1.35093,-1.026706 -2.973167,-1.539744 -4.864469,-1.539744 z" />
    </g>
  ),
}
