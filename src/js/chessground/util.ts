import * as cg from './interfaces'

export const files: cg.File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const invFiles: cg.File[] = files.slice().reverse()
export const ranks: cg.Rank[] = [1, 2, 3, 4, 5, 6, 7, 8]
export const invRanks: cg.Rank[] = [8, 7, 6, 5, 4, 3, 2, 1]
export const fileNumbers: { [i: string]: cg.Rank } = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8
}

export function pos2key(pos: cg.Pos): Key {
  return (files[pos[0] - 1] + pos[1]) as Key
}

export function key2pos(k: Key): cg.Pos {
  return [k.charCodeAt(0) - 96, k.charCodeAt(1) - 48] as cg.Pos
}

export function boardpos(pos: cg.Pos, asWhite: boolean): BoardPos {
  return {
    left: (asWhite ? pos[0] - 1 : 8 - pos[0]) * 12.5,
    bottom: (asWhite ? pos[1] - 1 : 8 - pos[1]) * 12.5
  }
}

export function posToTranslate(pos: cg.Pos, asWhite: boolean, bounds: ClientRect): NumberPair {
  return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8, (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
  ]
}

export function invertKey(k: Key) {
  return files[8 - fileNumbers[k[0]]] + (9 - Number(k[1]))
}

export const allPos: cg.Pos[] = (function() {
  const ps: cg.Pos[] = []
  invRanks.forEach((y) => {
    ranks.forEach((x) => {
      ps.push([x, y])
    })
  })
  return ps
})()

export const allKeys: Key[] =
  Array.prototype.concat(...files.map(c => ranks.map(r => c + r)))

export const invKeys: Key[] = allKeys.slice(0).reverse()

export function opposite(color: Color) {
  return color === 'white' ? 'black' : 'white'
}

export function containsX(xs: any[], x: any) {
  return xs && xs.indexOf(x) !== -1
}

export function distance(pos1: cg.Pos, pos2: cg.Pos) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}

export function transform(data: any, pieceColor: Color, translateProp: string) {
  if (data.otb) {
    const o = data.orientation
    const m = data.otbMode
    const t = data.turnColor
    if ((m === 'facing' && o === 'white' && pieceColor === 'black') ||
      (m === 'facing' && o === 'black' && pieceColor === 'white') ||
      (m === 'flip' && o === 'white' && t === 'black') ||
      (m === 'flip' && o === 'black' && t === 'white')
    ) {
      return translateProp + ' rotate(180deg)'
    } else {
      return translateProp
    }
  }

  return translateProp
}

export function translate(coord: NumberPair) {
  return 'translate(' + coord[0] + 'px,' + coord[1] + 'px)'
}

export function translate3d(coord: NumberPair) {
  return 'translate3d(' + coord[0] + 'px,' + coord[1] + 'px, 0)'
}

export const translateAway = translate([-99999, -99999])
export const translate3dAway = translate3d([-99999, -99999])

export function eventPosition(e: TouchEvent) {
  return [e.targetTouches[0].clientX, e.targetTouches[0].clientY]
}

export function computeSquareBounds(orientation: Color, bounds: ClientRect, key: Key) {
  const pos = key2pos(key)
  if (orientation !== 'white') {
    pos[0] = (9 - pos[0] as cg.Rank)
    pos[1] = (9 - pos[1] as cg.Rank)
  }
  return {
    left: bounds.left + bounds.width * (pos[0] - 1) / 8,
    top: bounds.top + bounds.height * (8 - pos[1]) / 8,
    width: bounds.width / 8,
    height: bounds.height / 8
  }
}
