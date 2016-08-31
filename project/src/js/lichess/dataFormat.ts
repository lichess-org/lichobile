
export interface MoveOrDrop {
  fen: string;
  threefold: boolean;
  check: boolean;
  ply: number;
  wDraw: boolean;
  bDraw: boolean;
  uci: string;
  san: string;
  status?: GameStatus;
  winner?: Color;
  crazyhouse?: {
    pockets: Pockets;
  }
  isMove?: boolean;
  clock?: {
    white: number;
    black: number;
  }
  promotion?: {
    key: Pos;
    pieceClass: Role;
  }
  role?: Role;
  enpassant: {
    key: Pos;
    color: Color;
  }
  dests: StringMap;
  drops: Array<string>;
  castle?: {
    king: [Pos, Pos];
    rook: [Pos, Pos];
    color: Color;
  }
}

