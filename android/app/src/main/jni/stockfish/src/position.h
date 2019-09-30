/*
  Stockfish, a UCI chess playing engine derived from Glaurung 2.1
  Copyright (C) 2004-2008 Tord Romstad (Glaurung author)
  Copyright (C) 2008-2015 Marco Costalba, Joona Kiiski, Tord Romstad
  Copyright (C) 2015-2018 Marco Costalba, Joona Kiiski, Gary Linscott, Tord Romstad

  Stockfish is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Stockfish is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#ifndef POSITION_H_INCLUDED
#define POSITION_H_INCLUDED

#include <cassert>
#include <deque>
#include <memory> // For std::unique_ptr
#include <string>

#include "bitboard.h"
#include "types.h"

/// StateInfo struct stores information needed to restore a Position object to
/// its previous state when we retract a move. Whenever a move is made on the
/// board (by calling Position::do_move), a StateInfo object must be passed.

struct StateInfo {

  // Copied when making a move
  Key    pawnKey;
  Key    materialKey;
  Value  nonPawnMaterial[COLOR_NB];
  int    castlingRights;
  int    rule50;
  int    pliesFromNull;
#ifdef THREECHECK
  CheckCount checksGiven[COLOR_NB];
#endif
  Square epSquare;

  // Not copied when making a move (will be recomputed anyhow)
  Key        key;
  Bitboard   checkersBB;
  Piece      capturedPiece;
#ifdef ATOMIC
  Piece      blast[SQUARE_NB];
#endif
#ifdef CRAZYHOUSE
  bool       capturedpromoted;
#endif
  StateInfo* previous;
  Bitboard   blockersForKing[COLOR_NB];
  Bitboard   pinners[COLOR_NB];
  Bitboard   checkSquares[PIECE_TYPE_NB];
};

/// A list to keep track of the position states along the setup moves (from the
/// start position to the position just before the search starts). Needed by
/// 'draw by repetition' detection. Use a std::deque because pointers to
/// elements are not invalidated upon list resizing.
typedef std::unique_ptr<std::deque<StateInfo>> StateListPtr;


/// Position class stores information regarding the board representation as
/// pieces, side to move, hash keys, castling info, etc. Important methods are
/// do_move() and undo_move(), used by the search to update node info when
/// traversing the search tree.
class Thread;

class Position {
public:
  static void init();

  Position() = default;
  Position(const Position&) = delete;
  Position& operator=(const Position&) = delete;

  // FEN string input/output
  Position& set(const std::string& fenStr, bool isChess960, Variant v, StateInfo* si, Thread* th);
  Position& set(const std::string& code, Color c, Variant v, StateInfo* si);
  const std::string fen() const;

  // Position representation
  Bitboard pieces() const;
  Bitboard pieces(PieceType pt) const;
  Bitboard pieces(PieceType pt1, PieceType pt2) const;
  Bitboard pieces(Color c) const;
  Bitboard pieces(Color c, PieceType pt) const;
  Bitboard pieces(Color c, PieceType pt1, PieceType pt2) const;
  Piece piece_on(Square s) const;
  Square ep_square() const;
  bool empty(Square s) const;
  template<PieceType Pt> int count(Color c) const;
  template<PieceType Pt> int count() const;
  template<PieceType Pt> const Square* squares(Color c) const;
  template<PieceType Pt> Square square(Color c) const;

  // Castling
  int can_castle(Color c) const;
  int can_castle(CastlingRight cr) const;
  bool castling_impeded(CastlingRight cr) const;
#if defined(ANTI) || defined(EXTINCTION) || defined(TWOKINGS)
  Square castling_king_square(CastlingRight cr) const;
#endif
  Square castling_rook_square(CastlingRight cr) const;

  // Checking
#ifdef ATOMIC
  bool kings_adjacent() const;
#endif
  Bitboard checkers() const;
  Bitboard blockers_for_king(Color c) const;
  Bitboard check_squares(PieceType pt) const;

  // Attacks to/from a given square
  Bitboard attackers_to(Square s) const;
  Bitboard attackers_to(Square s, Bitboard occupied) const;
#ifdef ATOMIC
  Bitboard slider_attackers_to(Square s) const;
  Bitboard slider_attackers_to(Square s, Bitboard occupied) const;
#endif
  Bitboard attacks_from(PieceType pt, Square s) const;
  template<PieceType> Bitboard attacks_from(Square s) const;
  template<PieceType> Bitboard attacks_from(Square s, Color c) const;
  Bitboard slider_blockers(Bitboard sliders, Square s, Bitboard& pinners) const;

  // Properties of moves
  bool legal(Move m) const;
  bool pseudo_legal(const Move m) const;
  bool capture(Move m) const;
  bool capture_or_promotion(Move m) const;
  bool gives_check(Move m) const;
  bool advanced_pawn_push(Move m) const;
  Piece moved_piece(Move m) const;
  Piece captured_piece() const;

  // Piece specific
  bool pawn_passed(Color c, Square s) const;
  bool opposite_bishops() const;

  // Doing and undoing moves
  void do_move(Move m, StateInfo& newSt);
  void do_move(Move m, StateInfo& newSt, bool givesCheck);
  void undo_move(Move m);
  void do_null_move(StateInfo& newSt);
  void undo_null_move();

  // Static Exchange Evaluation
#ifdef ATOMIC
  template<Variant V>
  Value see(Move m) const;
  template<Variant V>
  Value see(Move m, PieceType nextVictim, Square s) const;
#endif
  bool see_ge(Move m, Value threshold = VALUE_ZERO) const;

  // Accessing hash keys
  Key key() const;
  Key key_after(Move m) const;
  Key material_key() const;
  Key pawn_key() const;

  // Other properties of the position
  Color side_to_move() const;
  int game_ply() const;
  bool is_chess960() const;
  Variant variant() const;
  Variant subvariant() const;
  bool is_variant_end() const;
  Value variant_result(int ply = 0, Value draw_value = VALUE_DRAW) const;
  Value checkmate_value(int ply = 0) const;
  Value stalemate_value(int ply = 0, Value draw_value = VALUE_DRAW) const;
#ifdef ATOMIC
  bool is_atomic() const;
  bool is_atomic_win() const;
  bool is_atomic_loss() const;
#endif
#ifdef HORDE
  bool is_horde() const;
  bool is_horde_color(Color c) const;
  bool is_horde_loss() const;
#endif
#ifdef CRAZYHOUSE
  bool is_house() const;
  template<PieceType Pt> int count_in_hand(Color c) const;
  Value material_in_hand(Color c) const;
  void add_to_hand(Color c, PieceType pt);
  void remove_from_hand(Color c, PieceType pt);
  bool is_promoted(Square s) const;
  void drop_piece(Piece pc, Square s);
  void undrop_piece(Piece pc, Square s);
#endif
#ifdef BUGHOUSE
  bool is_bughouse() const;
#endif
#ifdef LOOP
  bool is_loop() const;
#endif
#ifdef EXTINCTION
  bool is_extinction() const;
  bool is_extinction_win() const;
  bool is_extinction_loss() const;
#endif
#ifdef GRID
  bool is_grid() const;
  GridLayout grid_layout() const;
  Bitboard grid_bb(Square s) const;
#endif
#ifdef DISPLACEDGRID
  bool is_displaced_grid() const;
#endif
#ifdef SLIPPEDGRID
  bool is_slipped_grid() const;
#endif
#ifdef KOTH
  bool is_koth() const;
  bool is_koth_win() const;
  bool is_koth_loss() const;
#endif
#ifdef LOSERS
  bool is_losers() const;
  bool is_losers_win() const;
  bool is_losers_loss() const;
  bool can_capture_losers() const;
#endif
#ifdef RACE
  bool is_race() const;
  bool is_race_win() const;
  bool is_race_draw() const;
  bool is_race_loss() const;
#endif
#ifdef THREECHECK
  bool is_three_check() const;
  bool is_three_check_win() const;
  bool is_three_check_loss() const;
  int checks_count() const;
  CheckCount checks_given(Color c) const;
#endif
#ifdef TWOKINGS
  bool is_two_kings() const;
  Square royal_king(Color c) const;
  Square royal_king(Color c, Bitboard kings) const;
#endif
#ifdef TWOKINGSSYMMETRIC
  bool is_two_kings_symmetric() const;
#endif
#ifdef ANTI
  bool is_anti() const;
  bool is_anti_win() const;
  bool is_anti_loss() const;
#endif
#if defined(ANTI) || defined(LOSERS)
  bool can_capture() const;
#endif
#ifdef SUICIDE
  bool is_suicide() const;
#endif
  Thread* this_thread() const;
  bool is_draw(int ply) const;
  bool has_game_cycle(int ply) const;
  bool has_repeated() const;
  int rule50_count() const;
  Score psq_score() const;
  Value non_pawn_material(Color c) const;
  Value non_pawn_material() const;

  // Position consistency check, for debugging
  bool pos_is_ok() const;
  void flip();

private:
  // Initialization helpers (used while setting up a position)
  void set_castling_right(Color c, Square kfrom, Square rfrom);
  void set_state(StateInfo* si) const;
  void set_check_info(StateInfo* si) const;

  // Other helpers
  void put_piece(Piece pc, Square s);
  void remove_piece(Piece pc, Square s);
  void move_piece(Piece pc, Square from, Square to);
  template<bool Do>
  void do_castling(Color us, Square from, Square& to, Square& rfrom, Square& rto);

  // Data members
  Piece board[SQUARE_NB];
  Bitboard byTypeBB[PIECE_TYPE_NB];
  Bitboard byColorBB[COLOR_NB];
  int pieceCount[PIECE_NB];
#ifdef HORDE
  Square pieceList[PIECE_NB][SQUARE_NB];
#else
  Square pieceList[PIECE_NB][16];
#endif
#ifdef CRAZYHOUSE
  int pieceCountInHand[COLOR_NB][PIECE_TYPE_NB];
  Bitboard promotedPieces;
#endif
  int index[SQUARE_NB];
  int castlingRightsMask[SQUARE_NB];
#if defined(ANTI) || defined(EXTINCTION) || defined(TWOKINGS)
  Square castlingKingSquare[CASTLING_RIGHT_NB];
#endif
  Square castlingRookSquare[CASTLING_RIGHT_NB];
  Bitboard castlingPath[CASTLING_RIGHT_NB];
  int gamePly;
  Color sideToMove;
  Score psq;
  Thread* thisThread;
  StateInfo* st;
  bool chess960;
  Variant var;
  Variant subvar;

};

namespace PSQT {
#ifdef CRAZYHOUSE
  extern Score psq[VARIANT_NB][PIECE_NB][SQUARE_NB+1];
#else
  extern Score psq[VARIANT_NB][PIECE_NB][SQUARE_NB];
#endif
}

extern std::ostream& operator<<(std::ostream& os, const Position& pos);

inline Color Position::side_to_move() const {
  return sideToMove;
}

inline bool Position::empty(Square s) const {
  return board[s] == NO_PIECE;
}

inline Piece Position::piece_on(Square s) const {
  return board[s];
}

inline Piece Position::moved_piece(Move m) const {
#ifdef CRAZYHOUSE
  if (type_of(m) == DROP)
      return dropped_piece(m);
#endif
  return board[from_sq(m)];
}

inline Bitboard Position::pieces() const {
  return byTypeBB[ALL_PIECES];
}

inline Bitboard Position::pieces(PieceType pt) const {
  return byTypeBB[pt];
}

inline Bitboard Position::pieces(PieceType pt1, PieceType pt2) const {
  return byTypeBB[pt1] | byTypeBB[pt2];
}

inline Bitboard Position::pieces(Color c) const {
  return byColorBB[c];
}

inline Bitboard Position::pieces(Color c, PieceType pt) const {
  return byColorBB[c] & byTypeBB[pt];
}

inline Bitboard Position::pieces(Color c, PieceType pt1, PieceType pt2) const {
  return byColorBB[c] & (byTypeBB[pt1] | byTypeBB[pt2]);
}

template<PieceType Pt> inline int Position::count(Color c) const {
#ifdef CRAZYHOUSE
  if (is_house())
      return pieceCount[make_piece(c, Pt)] + count_in_hand<Pt>(c);
#endif
  return pieceCount[make_piece(c, Pt)];
}

template<PieceType Pt> inline int Position::count() const {
#ifdef CRAZYHOUSE
  if (is_house())
      return pieceCount[make_piece(WHITE, Pt)] + count_in_hand<Pt>(BLACK) +
             pieceCount[make_piece(BLACK, Pt)] + count_in_hand<Pt>(BLACK);
#endif
  return pieceCount[make_piece(WHITE, Pt)] + pieceCount[make_piece(BLACK, Pt)];
}

template<PieceType Pt> inline const Square* Position::squares(Color c) const {
  return pieceList[make_piece(c, Pt)];
}

template<PieceType Pt> inline Square Position::square(Color c) const {
#ifdef EXTINCTION
  if (is_extinction() && Pt == KING && pieceCount[make_piece(c, Pt)] > 1)
      return pieceList[make_piece(c, Pt)][0]; // return the first king's square
#endif
#ifdef TWOKINGS
  if (is_two_kings() && Pt == KING && pieceCount[make_piece(c, Pt)] > 1)
      return royal_king(c);
#endif
#ifdef ANTI
  // There may be zero, one, or multiple kings
  if (is_anti() && pieceCount[make_piece(c, Pt)] == 0)
      return SQ_NONE;
  assert(is_anti() ? pieceCount[make_piece(c, Pt)] >= 1 : pieceCount[make_piece(c, Pt)] == 1);
#else
  assert(pieceCount[make_piece(c, Pt)] == 1);
#endif
  return pieceList[make_piece(c, Pt)][0];
}

#ifdef THREECHECK
inline bool Position::is_three_check() const {
  return var == THREECHECK_VARIANT;
}

inline bool Position::is_three_check_win() const {
  return st->checksGiven[sideToMove] == CHECKS_3;
}

inline bool Position::is_three_check_loss() const {
  return st->checksGiven[~sideToMove] == CHECKS_3;
}

inline int Position::checks_count() const {
  return st->checksGiven[WHITE] + st->checksGiven[BLACK];
}

inline CheckCount Position::checks_given(Color c) const {
  return st->checksGiven[c];
}
#endif

#ifdef TWOKINGS
inline bool Position::is_two_kings() const {
  return var == TWOKINGS_VARIANT;
}

inline Square Position::royal_king(Color c) const {
  return royal_king(c, pieces(c, KING));
}

inline Square Position::royal_king(Color c, Bitboard kings) const {
  assert(kings);
  // Find the royal king
  for (File f = FILE_A; f <= FILE_H; ++f)
  {
      if (kings & file_bb(f))
#ifdef TWOKINGSSYMMETRIC
          return backmost_sq(is_two_kings_symmetric() ? c : WHITE, kings & file_bb(f));
#else
          return backmost_sq(WHITE, kings & file_bb(f));
#endif
  }
  assert(false);
  return c == WHITE ? SQ_NONE : SQ_NONE; // silence two warnings
}
#endif

#ifdef TWOKINGSSYMMETRIC
inline bool Position::is_two_kings_symmetric() const {
  return subvar == TWOKINGSSYMMETRIC_VARIANT;
}
#endif

inline Square Position::ep_square() const {
  return st->epSquare;
}

inline int Position::can_castle(CastlingRight cr) const {
  return st->castlingRights & cr;
}

inline int Position::can_castle(Color c) const {
  return st->castlingRights & ((WHITE_OO | WHITE_OOO) << (2 * c));
}

inline bool Position::castling_impeded(CastlingRight cr) const {
  return byTypeBB[ALL_PIECES] & castlingPath[cr];
}

#if defined(ANTI) || defined(EXTINCTION) || defined(TWOKINGS)
inline Square Position::castling_king_square(CastlingRight cr) const {
  return castlingKingSquare[cr];
}
#endif

inline Square Position::castling_rook_square(CastlingRight cr) const {
  return castlingRookSquare[cr];
}

template<PieceType Pt>
inline Bitboard Position::attacks_from(Square s) const {
  assert(Pt != PAWN);
  return  Pt == BISHOP || Pt == ROOK ? attacks_bb<Pt>(s, byTypeBB[ALL_PIECES])
        : Pt == QUEEN  ? attacks_from<ROOK>(s) | attacks_from<BISHOP>(s)
        : PseudoAttacks[Pt][s];
}

template<>
inline Bitboard Position::attacks_from<PAWN>(Square s, Color c) const {
  return PawnAttacks[c][s];
}

inline Bitboard Position::attacks_from(PieceType pt, Square s) const {
  return attacks_bb(pt, s, byTypeBB[ALL_PIECES]);
}

inline Bitboard Position::attackers_to(Square s) const {
  return attackers_to(s, byTypeBB[ALL_PIECES]);
}

#ifdef ATOMIC
inline Bitboard Position::slider_attackers_to(Square s) const {
  return slider_attackers_to(s, byTypeBB[ALL_PIECES]);
}

inline bool Position::kings_adjacent() const {
  return attacks_from<KING>(square<KING>(~sideToMove)) & pieces(sideToMove, KING);
}
#endif

inline Bitboard Position::checkers() const {
  return st->checkersBB;
}

inline Bitboard Position::blockers_for_king(Color c) const {
  return st->blockersForKing[c];
}

inline Bitboard Position::check_squares(PieceType pt) const {
  return st->checkSquares[pt];
}

inline bool Position::pawn_passed(Color c, Square s) const {
#ifdef HORDE
  if (is_horde() && is_horde_color(c))
      return !(pieces(~c, PAWN) & forward_file_bb(c, s));
#endif
  return !(pieces(~c, PAWN) & passed_pawn_mask(c, s));
}

inline bool Position::advanced_pawn_push(Move m) const {
  return   type_of(moved_piece(m)) == PAWN
        && relative_rank(sideToMove, from_sq(m)) > RANK_4;
}

inline Key Position::key() const {
  return st->key;
}

inline Key Position::pawn_key() const {
  return st->pawnKey;
}

inline Key Position::material_key() const {
  return st->materialKey;
}

inline Score Position::psq_score() const {
  return psq;
}

inline Value Position::non_pawn_material(Color c) const {
  return st->nonPawnMaterial[c];
}

inline Value Position::non_pawn_material() const {
  return st->nonPawnMaterial[WHITE] + st->nonPawnMaterial[BLACK];
}

inline int Position::game_ply() const {
  return gamePly;
}

inline int Position::rule50_count() const {
  return st->rule50;
}

inline bool Position::opposite_bishops() const {
  return   pieceCount[W_BISHOP] == 1
        && pieceCount[B_BISHOP] == 1
        && opposite_colors(square<BISHOP>(WHITE), square<BISHOP>(BLACK));
}

#ifdef ATOMIC
template<Variant V>
Value Position::see(Move m) const {
  return see<V>(m, type_of(moved_piece(m)), to_sq(m));
}

inline bool Position::is_atomic() const {
  return var == ATOMIC_VARIANT;
}

// Loss if king is captured (Atomic)
inline bool Position::is_atomic_win() const {
  return count<KING>(~sideToMove) == 0;
}

// Loss if king is captured (Atomic)
inline bool Position::is_atomic_loss() const {
  return count<KING>(sideToMove) == 0;
}
#endif

#ifdef EXTINCTION
inline bool Position::is_extinction() const {
  return var == EXTINCTION_VARIANT;
}

inline bool Position::is_extinction_win() const {
  return !(   count<  KING>(~sideToMove) && count< QUEEN>(~sideToMove) && count<ROOK>(~sideToMove)
           && count<BISHOP>(~sideToMove) && count<KNIGHT>(~sideToMove) && count<PAWN>(~sideToMove));
}

inline bool Position::is_extinction_loss() const {
  return !(   count<  KING>(sideToMove) && count< QUEEN>(sideToMove) && count<ROOK>(sideToMove)
           && count<BISHOP>(sideToMove) && count<KNIGHT>(sideToMove) && count<PAWN>(sideToMove));
}
#endif

#ifdef GRID
inline bool Position::is_grid() const {
  return var == GRID_VARIANT;
}

inline GridLayout Position::grid_layout() const {
  assert(var == GRID_VARIANT);
  switch (subvar)
  {
  case GRID_VARIANT:
      return NORMAL_GRID;
#ifdef DISPLACEDGRID
  case DISPLACEDGRID_VARIANT:
      return DISPLACED_GRID;
#endif
#ifdef SLIPPEDGRID
  case SLIPPEDGRID_VARIANT:
      return SLIPPED_GRID;
#endif
  default:
      assert(false);
      return NORMAL_GRID;
  }
}

inline Bitboard Position::grid_bb(Square s) const {
  return grid_layout_bb(grid_layout(), s);
}
#endif

#ifdef DISPLACEDGRID
inline bool Position::is_displaced_grid() const {
  return subvar == DISPLACEDGRID_VARIANT;
}
#endif

#ifdef SLIPPEDGRID
inline bool Position::is_slipped_grid() const {
  return subvar == SLIPPEDGRID_VARIANT;
}
#endif

#ifdef HORDE
inline bool Position::is_horde() const {
  return var == HORDE_VARIANT;
}

inline bool Position::is_horde_color(Color c) const {
  return pieceCount[make_piece(c, KING)] == 0;
}

// Loss if horde is captured (Horde)
inline bool Position::is_horde_loss() const {
  return count<ALL_PIECES>(is_horde_color(WHITE) ? WHITE : BLACK) == 0;
}
#endif

#ifdef ANTI
inline bool Position::is_anti() const {
  return var == ANTI_VARIANT;
}

inline bool Position::is_anti_loss() const {
  return count<ALL_PIECES>(~sideToMove) == 0;
}

inline bool Position::is_anti_win() const {
  return count<ALL_PIECES>(sideToMove) == 0;
}
#endif

#if defined(ANTI) || defined(LOSERS)
inline bool Position::can_capture() const {
  Square ep = ep_square();
  assert(ep == SQ_NONE
         || (attacks_from<PAWN>(ep, ~sideToMove) & pieces(sideToMove, PAWN)));
  if (ep != SQ_NONE)
      return true;
  Bitboard target = pieces(~sideToMove);
  Bitboard b1 = pieces(sideToMove, PAWN), b2 = pieces(sideToMove) - b1;
  if ((sideToMove == WHITE ? pawn_attacks_bb<WHITE>(b1) : pawn_attacks_bb<BLACK>(b1)) & target)
      return true;
  while (b2)
  {
      Square s = pop_lsb(&b2);
      if (attacks_from(type_of(piece_on(s)), s) & target)
          return true;
  }
  return false;
}
#endif

#ifdef LOSERS
inline bool Position::is_losers() const {
  return var == LOSERS_VARIANT;
}

inline bool Position::is_losers_loss() const {
  return count<ALL_PIECES>(~sideToMove) == 1;
}

inline bool Position::is_losers_win() const {
  return count<ALL_PIECES>(sideToMove) == 1;
}

// Position::can_capture_losers tests whether we have a legal capture
// in a losers chess position.

inline bool Position::can_capture_losers() const {

  // A king may capture undefended pieces
  Square ksq = square<KING>(sideToMove);
  Bitboard attacks = attacks_from<KING>(ksq) & pieces(~sideToMove);

  // If not in check, unpinned non-king pieces and pawns may freely capture
  if (!attacks && !checkers() && !st->blockersForKing[sideToMove] && ep_square() == SQ_NONE)
      return can_capture();
  while (attacks)
      if (!(attackers_to(pop_lsb(&attacks), pieces() ^ ksq) & pieces(~sideToMove)))
          return true;

  // Any non-king capture must capture the checking piece(s)
  Bitboard target = checkers() ? checkers() : pieces(~sideToMove);
  if (more_than_one(checkers()))
      return false;

  Square ep = ep_square();
  assert(ep == SQ_NONE
         || (attacks_from<PAWN>(ep, ~sideToMove) & pieces(sideToMove, PAWN)));
  if (ep != SQ_NONE)
  {
      Bitboard b = attacks_from<PAWN>(ep, ~sideToMove) & pieces(sideToMove, PAWN);
      while (b)
      {
          // Test en passant legality by simulating the move
          Square from = pop_lsb(&b);
          Square capsq = ep - pawn_push(sideToMove);
          Bitboard occupied = (pieces() ^ from ^ capsq) | ep;

          assert(piece_on(capsq) == make_piece(~sideToMove, PAWN));
          assert(piece_on(ep) == NO_PIECE);

          if (   !(attacks_bb<  ROOK>(ksq, occupied) & pieces(~sideToMove, QUEEN, ROOK))
              && !(attacks_bb<BISHOP>(ksq, occupied) & pieces(~sideToMove, QUEEN, BISHOP)))
              return true;
      }
  }

  // Loop over our pieces to find legal captures
  Bitboard b = pieces(sideToMove) ^ ksq;
  while (b)
  {
      Square s = pop_lsb(&b);
      PieceType pt = type_of(piece_on(s));
      attacks = pt == PAWN ? attacks_from<PAWN>(s, sideToMove) : attacks_from(pt, s);

      // A pinned piece may only capture along the pin
      if (st->blockersForKing[sideToMove] & s)
          attacks &= LineBB[s][ksq];
      if (attacks & target)
          return true;
  }
  return false;
}
#endif

#ifdef SUICIDE
inline bool Position::is_suicide() const {
    return subvar == SUICIDE_VARIANT;
}
#endif

#ifdef CRAZYHOUSE
inline bool Position::is_house() const {
  return var == CRAZYHOUSE_VARIANT;
}

template<PieceType Pt> inline int Position::count_in_hand(Color c) const {
  return pieceCountInHand[c][Pt];
}

inline Value Position::material_in_hand(Color c) const {
  Value v = VALUE_ZERO;
  for (PieceType pt = PAWN; pt <= QUEEN; ++pt)
      v += pieceCountInHand[c][pt] * PieceValue[var][MG][pt];
  return v;
}

inline void Position::add_to_hand(Color c, PieceType pt) {
  pieceCountInHand[c][pt]++;
  pieceCountInHand[c][ALL_PIECES]++;
  psq += PSQT::psq[var][make_piece(c, pt)][SQ_NONE];
}

inline void Position::remove_from_hand(Color c, PieceType pt) {
  pieceCountInHand[c][pt]--;
  pieceCountInHand[c][ALL_PIECES]--;
  psq -= PSQT::psq[var][make_piece(c, pt)][SQ_NONE];
}

inline bool Position::is_promoted(Square s) const {
  return promotedPieces & s;
}
#endif

#ifdef BUGHOUSE
inline bool Position::is_bughouse() const {
  return subvar == BUGHOUSE_VARIANT;
}
#endif

#ifdef LOOP
inline bool Position::is_loop() const {
  return subvar == LOOP_VARIANT;
}
#endif

#ifdef KOTH
inline bool Position::is_koth() const {
  return var == KOTH_VARIANT;
}

// Win if king is in the center (KOTH)
inline bool Position::is_koth_win() const {
  Square ksq = square<KING>(sideToMove);
  return (rank_of(ksq) == RANK_4 || rank_of(ksq) == RANK_5) &&
         (file_of(ksq) == FILE_D || file_of(ksq) == FILE_E);
}

// Loss if king is in the center (KOTH)
inline bool Position::is_koth_loss() const {
  Square ksq = square<KING>(~sideToMove);
  return (rank_of(ksq) == RANK_4 || rank_of(ksq) == RANK_5) &&
         (file_of(ksq) == FILE_D || file_of(ksq) == FILE_E);
}
#endif

#ifdef RACE
inline bool Position::is_race() const {
  return var == RACE_VARIANT;
}

// Win if king is on the eighth rank (Racing Kings)
inline bool Position::is_race_win() const {
  return rank_of(square<KING>(sideToMove)) == RANK_8
        && rank_of(square<KING>(~sideToMove)) < RANK_8;
}

// Draw if kings are on the eighth rank (Racing Kings)
inline bool Position::is_race_draw() const {
  return rank_of(square<KING>(sideToMove)) == RANK_8
        && rank_of(square<KING>(~sideToMove)) == RANK_8;
}

// Loss if king is on the eighth rank (Racing Kings)
inline bool Position::is_race_loss() const {
  if (rank_of(square<KING>(~sideToMove)) != RANK_8)
      return false;
  if (rank_of(square<KING>(sideToMove)) < (sideToMove == WHITE ? RANK_8 : RANK_7))
      return true;
  // Check whether the black king can move to the eighth rank
  Bitboard b = attacks_from<KING>(square<KING>(sideToMove)) & rank_bb(RANK_8) & ~pieces(sideToMove);
  while (b)
      if (!(attackers_to(pop_lsb(&b)) & pieces(~sideToMove)))
          return false;
  return true;
}
#endif

inline bool Position::is_chess960() const {
  return chess960;
}

inline Variant Position::variant() const {
  return var;
}

inline Variant Position::subvariant() const {
    return subvar;
}

inline bool Position::is_variant_end() const {
  switch (var)
  {
#ifdef ANTI
  case ANTI_VARIANT:
      return is_anti_win() || is_anti_loss();
#endif
#ifdef ATOMIC
  case ATOMIC_VARIANT:
      return is_atomic_win() || is_atomic_loss();
#endif
#ifdef EXTINCTION
  case EXTINCTION_VARIANT:
      return is_extinction_win() || is_extinction_loss();
#endif
#ifdef HORDE
  case HORDE_VARIANT:
      return is_horde_loss();
#endif
#ifdef KOTH
  case KOTH_VARIANT:
      return is_koth_win() || is_koth_loss();
#endif
#ifdef LOSERS
  case LOSERS_VARIANT:
      return is_losers_win() || is_losers_loss();
#endif
#ifdef RACE
  case RACE_VARIANT:
      return is_race_draw() || is_race_win() || is_race_loss();
#endif
#ifdef THREECHECK
  case THREECHECK_VARIANT:
      return is_three_check_win() || is_three_check_loss();
#endif
  default:
      return false;
  }
}

inline Value Position::variant_result(int ply, Value draw_value) const {
  switch (var)
  {
#ifdef ANTI
  case ANTI_VARIANT:
      if (is_anti_win())
          return mate_in(ply);
      if (is_anti_loss())
          return mated_in(ply);
      break;
#endif
#ifdef ATOMIC
  case ATOMIC_VARIANT:
      if (is_atomic_win())
          return mate_in(ply);
      if (is_atomic_loss())
          return mated_in(ply);
      break;
#endif
#ifdef EXTINCTION
  case EXTINCTION_VARIANT:
      if (is_extinction_win())
          return mate_in(ply);
      if (is_extinction_loss())
          return mated_in(ply);
      break;
#endif
#ifdef HORDE
  case HORDE_VARIANT:
      if (is_horde_loss())
          return mated_in(ply);
      break;
#endif
#ifdef KOTH
  case KOTH_VARIANT:
      if (is_koth_win())
          return mate_in(ply);
      if (is_koth_loss())
          return mated_in(ply);
      break;
#endif
#ifdef LOSERS
  case LOSERS_VARIANT:
      if (is_losers_win())
          return mate_in(ply);
      if (is_losers_loss())
          return mated_in(ply);
      break;
#endif
#ifdef RACE
  case RACE_VARIANT:
      if (is_race_draw())
          return draw_value;
      if (is_race_win())
          return mate_in(ply);
      if (is_race_loss())
          return mated_in(ply);
      break;
#endif
#ifdef THREECHECK
  case THREECHECK_VARIANT:
      if (is_three_check_win())
          return mate_in(ply);
      if (is_three_check_loss())
          return mated_in(ply);
      break;
#endif
  default:;
  }
  // variant_result should not be called if is_variant_end is false.
  assert(false);
  return VALUE_ZERO;
}

inline Value Position::checkmate_value(int ply) const {
#ifdef LOSERS
  if (is_losers())
      return mate_in(ply);
#endif
  return mated_in(ply);
}

inline Value Position::stalemate_value(int ply, Value drawValue) const {
#ifdef ANTI
  if (is_anti())
  {
#ifdef SUICIDE
      if (is_suicide())
      {
          int balance = pieceCount[make_piece(sideToMove, ALL_PIECES)] - pieceCount[make_piece(~sideToMove, ALL_PIECES)];
          if (balance > 0)
              return mated_in(ply);
          if (balance < 0)
              return mate_in(ply);
          return drawValue;
      }
#endif
      return mate_in(ply);
  }
#endif
#ifdef LOSERS
  if (is_losers())
      return mate_in(ply);
#endif
  return drawValue;
}

inline bool Position::capture_or_promotion(Move m) const {
  assert(is_ok(m));
#ifdef RACE
  if (is_race())
  {
    Square from = from_sq(m), to = to_sq(m);
    return (type_of(board[from]) == KING && rank_of(to) > rank_of(from)) || !empty(to);
  }
#endif
#ifdef CRAZYHOUSE
  return type_of(m) != NORMAL ? type_of(m) != DROP && type_of(m) != CASTLING : !empty(to_sq(m));
#else
  return type_of(m) != NORMAL ? type_of(m) != CASTLING : !empty(to_sq(m));
#endif
}

inline bool Position::capture(Move m) const {
  assert(is_ok(m));
  // Castling is encoded as "king captures rook"
  return (!empty(to_sq(m)) && type_of(m) != CASTLING) || type_of(m) == ENPASSANT;
}

inline Piece Position::captured_piece() const {
  return st->capturedPiece;
}

inline Thread* Position::this_thread() const {
  return thisThread;
}

inline void Position::put_piece(Piece pc, Square s) {

  board[s] = pc;
  byTypeBB[ALL_PIECES] |= s;
  byTypeBB[type_of(pc)] |= s;
  byColorBB[color_of(pc)] |= s;
  index[s] = pieceCount[pc]++;
  pieceList[pc][index[s]] = s;
  pieceCount[make_piece(color_of(pc), ALL_PIECES)]++;
  psq += PSQT::psq[var][pc][s];
}

inline void Position::remove_piece(Piece pc, Square s) {

  // WARNING: This is not a reversible operation. If we remove a piece in
  // do_move() and then replace it in undo_move() we will put it at the end of
  // the list and not in its original place, it means index[] and pieceList[]
  // are not invariant to a do_move() + undo_move() sequence.
  byTypeBB[ALL_PIECES] ^= s;
  byTypeBB[type_of(pc)] ^= s;
  byColorBB[color_of(pc)] ^= s;
#ifdef ATOMIC
  if (is_atomic())
      board[s] = NO_PIECE;
#endif
  /* board[s] = NO_PIECE;  Not needed, overwritten by the capturing one */
  Square lastSquare = pieceList[pc][--pieceCount[pc]];
  index[lastSquare] = index[s];
  pieceList[pc][index[lastSquare]] = lastSquare;
  pieceList[pc][pieceCount[pc]] = SQ_NONE;
  pieceCount[make_piece(color_of(pc), ALL_PIECES)]--;
  psq -= PSQT::psq[var][pc][s];
}

inline void Position::move_piece(Piece pc, Square from, Square to) {

  // index[from] is not updated and becomes stale. This works as long as index[]
  // is accessed just by known occupied squares.
  Bitboard fromTo = SquareBB[from] ^ SquareBB[to];
  byTypeBB[ALL_PIECES] ^= fromTo;
  byTypeBB[type_of(pc)] ^= fromTo;
  byColorBB[color_of(pc)] ^= fromTo;
  board[from] = NO_PIECE;
  board[to] = pc;
  index[to] = index[from];
  pieceList[pc][index[to]] = to;
  psq += PSQT::psq[var][pc][to] - PSQT::psq[var][pc][from];
}

#ifdef CRAZYHOUSE
inline void Position::drop_piece(Piece pc, Square s) {
  assert(pieceCountInHand[color_of(pc)][type_of(pc)]);
  put_piece(pc, s);
  remove_from_hand(color_of(pc), type_of(pc));
}

inline void Position::undrop_piece(Piece pc, Square s) {
  remove_piece(pc, s);
  board[s] = NO_PIECE;
  add_to_hand(color_of(pc), type_of(pc));
  assert(pieceCountInHand[color_of(pc)][type_of(pc)]);
}
#endif

inline void Position::do_move(Move m, StateInfo& newSt) {
  do_move(m, newSt, gives_check(m));
}

#endif // #ifndef POSITION_H_INCLUDED
