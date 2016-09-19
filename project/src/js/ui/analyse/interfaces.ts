export interface RoleToSan {
  [role: string]: San
}

export interface SanToRole {
  [san: string]: Role
}

export type Source = 'online' | 'offline' | 'fen';

export interface PathObj {
  ply: number
  variation: any
}

export type Path = Array<PathObj>

export interface AnalyseInterface {
  firstPly(): number
  lastPly(): number
  getStep(path: Path): AnalysisStep
  getStepAtPly(ply: number): AnalysisStep
  getSteps(path: Path): Array<AnalysisStep>
  getStepsAfterPly(path: Path, ply: number): Array<AnalysisStep>
  getOpening(path: Path): any
  nextStepEvalBest(path: Path): number
  addStep(step: AnalysisStep, path: Path): Path
  addDests(dests: DestsMap, path: Path): void
  updateAtPath(path: Path, update: (s: AnalysisStep) => void): void
  deleteVariation(ply: number, id: number): void
  promoteVariation(ply: number, id: number): void
  plyOfNextNag(color: Color, nag: string, fromPly: number): number
}
