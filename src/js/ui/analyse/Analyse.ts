import treePath from './path'
import { AnalysisData, AnalysisStep, Path, PathObj } from './interfaces'
import { GameSituation } from '../../chess'

export default class Analyse {
  public tree: Array<AnalysisStep>

  constructor(data: AnalysisData) {
    configureSteps(data)

    this.tree = data.steps
  }

  public firstPly = () => {
    return this.tree[0].ply
  }

  public lastPly = () => {
    return this.tree[this.tree.length - 1].ply
  }

  public getStep = (path: Path) => {
    let tree = this.tree
    for (let j in path) {
      const p = path[j]
      for (let i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          const vs = tree[i].variations
          if (vs && p.variation) {
            tree = vs[p.variation - 1]
            break
          }
          return tree[i]
        }
      }
    }
  }

  public getStepAtPly = (ply: number) => {
    return this.getStep(treePath.default(ply))
  }

  public getOpening(path: Path) {
    const steps = this.getSteps(path)
    let opening
    if (steps && steps.length > 0) {
      for (let i = 0, len = steps.length; i < len; i++) {
        const s = steps[i]
        opening = s.opening || opening
      }
    }
    return opening
  }

  public getSteps = (path: Path) => {
    let tree = this.tree
    const lsteps: AnalysisStep[] = []
    for (let j in path) {
      const p = path[j]
      for (let i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          const vs = tree[i].variations
          if (vs && p.variation) {
            tree = vs[p.variation - 1]
            break
          }
          lsteps.push(tree[i])
          return lsteps
        } else {
          lsteps.push(tree[i])
        }
      }
    }
  }

  public getStepsAfterPly = (path: Path, ply: number): AnalysisStep[] => {
    if (path[0].ply <= ply) return []
    const steps = this.getSteps(path)
    if (steps && steps.length) {
      return steps.filter((step: AnalysisStep) => {
        return step.ply > ply
      })
    }

    return []
  }

  public nextStepEvalBest = (path: Path): string | undefined => {
    if (!treePath.isRoot(path)) return undefined
    const nextPly = path[0].ply + 1
    const nextStep = this.tree[nextPly - this.firstPly()]
    return (nextStep && nextStep.rEval) ? nextStep.rEval.best : undefined
  }

  public addStep = (step: AnalysisStep, path: Path) => {
    const nextPath = treePath.withPly(path, treePath.currentPly(path) + 1)
    let tree = this.tree
    let curStep: AnalysisStep | undefined = undefined
    nextPath.forEach((p: PathObj) => {
      for (let i = 0, nb = tree.length; i < nb; i++) {
        const s = tree[i]
        const vs = s.variations
        if (p.ply === s.ply) {
          if (vs && p.variation) {
            tree = vs[p.variation - 1]
            break
          } else curStep = s
        } else if (p.ply < s.ply) break
      }
    })
    if (isStep(curStep)) {
      curStep.variations = curStep.variations || []
      if (curStep.san === step.san) return nextPath
      for (let i = 0; i < curStep.variations.length; i++) {
        if (curStep.variations[i][0].san === step.san)
          return treePath.withVariation(nextPath, i + 1)
      }
      curStep.variations.push([step])
      return treePath.withVariation(nextPath, curStep.variations.length)
    }
    tree.push(step)
    return nextPath
  }

  public addStepSituationData = (situation: GameSituation, path: Path) => {
    this.updateAtPath(path, (step: AnalysisStep) => {
      step.dests = situation.dests
      step.end = situation.end
      step.player = situation.player
    })
  }

  public updateAtPath = (path: Path, update: (s: AnalysisStep) => void) => {
    let tree = this.tree
    for (let j in path) {
      const p = path[j]
      for (let i = 0, nb = tree.length; i < nb; i++) {
        if (p.ply === tree[i].ply) {
          const vs = tree[i].variations
          if (vs && p.variation) {
            tree = vs[p.variation - 1]
            break
          }
          update(tree[i])
          return
        }
      }
    }
  }

  public deleteVariation = (ply: number, id: number) => {
    this.updateAtPath(treePath.default(ply), (node: AnalysisStep) => {
      if (node.variations) {
        node.variations.splice(id - 1, 1)
        if (!node.variations.length) delete node.variations
      }
    })
  }

  public promoteVariation = (ply: number, id: number) => {
    const stepId = this.tree.findIndex(s => s.ply === ply)
    const step = this.getStepAtPly(ply)
    const variation = step && step.variations && step.variations[id - 1]
    if (variation) {
      this.deleteVariation(ply, id)
      const demoted = this.tree.splice(stepId)
      this.tree = this.tree.concat(variation)
      const lastMainPly = this.tree[stepId]
      lastMainPly.variations = lastMainPly.variations || []
      lastMainPly.variations.push(demoted)
    }
  }

  public plyOfNextNag = (color: Color, nag: string, fromPly: number) => {
    const len = this.tree.length
    for (let i = 1; i < len; i++) {
      const ply = (fromPly + i) % len
      if (this.tree[ply].nag === nag && (ply % 2 === (color === 'white' ? 1 : 0))) return ply
    }
  }
}

function configureSteps(data: AnalysisData) {
  const steps = data.steps
  const analysis = data.analysis
  for (let i = 0, len = steps.length; i < len; i++) {
    const s = steps[i]
    s.fixed = true
    if (analysis) {
      const move = i - 1 >= 0 ? analysis.moves[i - 1] : null
      if (move) {
        s.rEval = {
          cp: move.eval,
          best: move.best,
          mate: move.mate,
          variation: move.variation,
          judgment: move.judgment
        }
      }
    }
  }
}

function isStep(v: AnalysisStep | undefined): v is AnalysisStep {
  return v !== undefined
}
