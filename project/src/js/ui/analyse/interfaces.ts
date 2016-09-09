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

export interface ChessMove {
  situation: GameSituation
  path: string
}

export interface ChesslogicInterface {
  sendMoveRequest(req: any): void
  sendDropRequest(req: any): void
  sendDestsRequest(req: any): void
  getSanMoveFromUci(req: any): Promise<ChessMove>
  importPgn(pgn: string): Promise<{ pgn: string }>
  exportPgn(variant: string, initialFen: string, pgnMoves: Array<string>): Promise<{ pgn: string }>
  terminate(): void
}

export interface AnalyseCtrlInterface {
  data: AnalysisData;
  source: Source;
  vm: any;
  chessLogic: ChesslogicInterface;

  addStep(step: AnalysisStep, path: Path): void
  addDests(dests: DestsMap, path: Path): void
}
