
declare namespace Stockfish {
  interface Static {
    init(): Promise<any>
    cmd(cmd: string): Promise<any>
    output(success: (msg: string) => void, err?: (err: string) => void): void
    exit(): Promise<any>
  }
}

declare const Stockfish: Stockfish.Static;
