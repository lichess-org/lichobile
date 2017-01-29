declare namespace Chessground {
  type Color = 'white' | 'black';
  type Pos = 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';
  type Piece = {
    role: Role;
    color: Color;
  }
  type Bounds = {
    top: number;
    left: number;
    width: number;
    height: number;
  }
  type Pieces = {[index: string]: Piece};

  interface SetConfig {
    orientation?: Color;
    fen?: string;
    lastMove?: [Pos, Pos];
    check?: boolean;
    turnColor?: Color;
    movableColor?: Color;
    dests?: {[index: string]: Array<Pos>};
  }

  interface Controller {
    data: any;
    getFen(): string;
    set(cfg: SetConfig): void;
    reconfigure(cfg: any): void;
    toggleOrientation(): void;
    setPieces(pieces: Pieces): void;
    setDragPiece(key: Pos, piece: Piece, dragOpts: any): void;
    selectSquare(key: Pos): void;
    apiMove(orig: Pos, dest: Pos, pieces?: Pieces, config?: SetConfig): void;
    apiNewPiece(piece: Piece, key: Pos, config?: SetConfig): void;
    playPremove(): void;
    playPredrop(validate: (drop: Drop) => boolean): void;
    cancelPremove(): void;
    cancelPredrop(): void;
    setCheck(color: Color): void;
    cancelMove(): void;
    stop(): void;
    explode(keys: Array<Pos>): void;
    setBounds(bounds: Bounds): void;
    unload(): void;
  }

  interface Api {
    set(cfg: SetConfig): void
    toggleOrientation(): void
    getOrientation(): Color
    setBounds(bounds: Bounds): void;
    getPieces(): Pieces
    getMaterialDiff(): any
    getFen(): string
    dump(): any
    move(orig: Pos, dest: Pos, pieces?: Pieces, config?: SetConfig): void;
    setPieces(pieces: Pieces): void;
    setCheck(color: Color): void;
    playPremove(): void;
    cancelPremove(): void;
    cancelMove(): void;
    stop(): void;
    explode(keys: Array<Pos>): void;
  }

  interface ControllerFactory {
    new(cfg: any): Controller;
  }

  interface Fen {
    read(fen: string): {[index: string]: Piece};
    write(pieces: {[index: string]: Piece}): string;
    initial: string
  }

  interface Static {
    (
      el: HTMLElement,
      cfg: any
    ): Api

    render(
      rootElement: Element,
      controller: Controller
    ): void;

    controller: ControllerFactory;
    view(ctrl: Controller): Mithril.Vnode<any, any>

    fen: Fen;

    util: any;

    board: any;

    drag: any;
  }
}
