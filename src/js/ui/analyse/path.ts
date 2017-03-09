import { Path, PathObj } from './interfaces'

export default {

  default(ply?: number): Path {
    return [{
      ply: ply || 0,
      variation: undefined
    } as PathObj]
  },

  read(str: string): Path {
    return str.split(',').map(step => {
      const s = step.split(':')
      return {
        ply: ~~s[0],
        variation: s[1] ? ~~s[1] : undefined
      }
    })
  },

  write(path: Path): string {
    return path.map((step: PathObj) => {
      return step.variation ? step.ply + ':' + step.variation : step.ply
    }).join(',')
  },

  isRoot(path: Path) {
    return path.length === 1
  },

  contains(p1: Path, p2: Path) {
    if (p2.length < p1.length) return false
    for (let i = 0; i < p2.length; i++) {
      if (!p1[i].variation) return true
      if (p1[i].ply !== p2[i].ply || p1[i].variation !== p2[i].variation) return false
    }
    return false
  },

  currentPly(path: Path) {
    return path[path.length - 1].ply
  },

  withPly(path: Path, ply: number) {
    const p2 = path.slice(0)
    const last = p2.length - 1
    p2[last] = copy(p2[last], {
      ply: ply
    })
    return p2
  },

  withVariation(path: Path, index: number) {
    const p2 = path.slice(0)
    const last = p2.length - 1
    const ply = p2[last].ply
    p2[last] = copy(p2[last], {
      ply: ply,
      variation: index
    })
    p2.push({
      ply: ply,
      variation: undefined
    })
    return p2
  },

  withoutVariation(path: Path) {
    const p2 = path.slice(0, path.length - 1)
    const last = p2.length - 1
    p2[last] = copy(p2[last], {
      variation: undefined
    })
    return p2
  }
}

function copy(obj: PathObj, newValues: Partial<PathObj>): PathObj {
  const c: any = {}
  for (let k in obj) {
    c[k] = (<any>obj)[k]
  }
  for (let k in newValues) {
    c[k] = (<any>newValues)[k]
  }
  return c as PathObj
}
