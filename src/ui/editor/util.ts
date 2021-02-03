import { parseCastlingFen, parseFen } from "chessops/fen";
import { defined } from "chessops/util";
import { Castles } from "chessops/variant";
import { Prop } from "~/utils";

const CASTLING_TOGGLES = ['K', 'Q', 'k', 'q']

export interface CastlingToggles {
  K: Prop<boolean>
  Q: Prop<boolean>
  k: Prop<boolean>
  q: Prop<boolean>
  [k: string]: Prop<boolean>
}

export function castlingToggleFEN(toggles: CastlingToggles): string {
  return CASTLING_TOGGLES.reduce((str, key) => {
    if (toggles[key]()) {
      return str + key
    }
    return str
  }, '')
}

export function castlesMetadataStr(castlingToggles: CastlingToggles, fen: string): Fen {
  const setup = parseFen(fen).unwrap()
  const unmovedRooks = parseCastlingFen(setup.board, castlingToggleFEN(castlingToggles)).unwrap()
  const castles = Castles.fromSetup({...setup, unmovedRooks})
  const legalCastlesMap = {
    K: castles.rook.white.a,
    Q: castles.rook.white.h,
    k: castles.rook.black.a,
    q: castles.rook.black.h,
  } as {[k: string]: number | undefined}

  const castlesStr = Object.keys(castlingToggles).reduce((str, piece) => {
    if ((castlingToggles[piece])() && defined(legalCastlesMap[piece])) {
      return str + piece
    }
    return str
  }, '')

  return castlesStr.length ? castlesStr : '-'
}
