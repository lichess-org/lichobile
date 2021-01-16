// multi-variant cordova stockfish plugin
declare namespace Stockfish {
  interface Static {
    init(): Promise<void>
    cmd(cmd: string): Promise<void>
    output(success: (msg: string) => void, err?: (err: string) => void): void
    exit(): Promise<void>
  }
}
