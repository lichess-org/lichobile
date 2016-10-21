import { Path } from '../interfaces'

export interface Work {
  position: string
  moves: string
  path: Path
  steps: Array<AnalysisStep>
  ply: number
  emit: (res: any) => void
}

