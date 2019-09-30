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

#include <algorithm>
#include <cassert>
#include <cstddef> // For offsetof()
#include <cstring> // For std::memset, std::memcmp
#include <iomanip>
#include <sstream>

#include "bitboard.h"
#include "misc.h"
#include "movegen.h"
#include "position.h"
#include "thread.h"
#include "tt.h"
#include "uci.h"
#include "syzygy/tbprobe.h"

using std::string;

namespace Zobrist {

  Key psq[PIECE_NB][SQUARE_NB];
  Key enpassant[FILE_NB];
  Key castling[CASTLING_RIGHT_NB];
  Key side, noPawns;
  Key variant[VARIANT_NB];
#ifdef CRAZYHOUSE
  Key inHand[PIECE_NB][17];
#endif
#ifdef THREECHECK
  Key checks[COLOR_NB][CHECKS_NB];
#endif
}

namespace {

const string PieceToChar(" PNBRQK  pnbrqk");

constexpr Piece Pieces[] = { W_PAWN, W_KNIGHT, W_BISHOP, W_ROOK, W_QUEEN, W_KING,
                             B_PAWN, B_KNIGHT, B_BISHOP, B_ROOK, B_QUEEN, B_KING };

// min_attacker() is a helper function used by see_ge() to locate the least
// valuable attacker for the side to move, remove the attacker we just found
// from the bitboards and scan for new X-ray attacks behind it.

template<int Pt>
PieceType min_attacker(const Bitboard* byTypeBB, Square to, Bitboard stmAttackers,
                       Bitboard& occupied, Bitboard& attackers) {

  Bitboard b = stmAttackers & byTypeBB[Pt];
  if (!b)
      return min_attacker<Pt + 1>(byTypeBB, to, stmAttackers, occupied, attackers);

  occupied ^= lsb(b); // Remove the attacker from occupied

  // Add any X-ray attack behind the just removed piece. For instance with
  // rooks in a8 and a7 attacking a1, after removing a7 we add rook in a8.
  // Note that new added attackers can be of any color.
  if (Pt == PAWN || Pt == BISHOP || Pt == QUEEN)
      attackers |= attacks_bb<BISHOP>(to, occupied) & (byTypeBB[BISHOP] | byTypeBB[QUEEN]);

  if (Pt == ROOK || Pt == QUEEN)
      attackers |= attacks_bb<ROOK>(to, occupied) & (byTypeBB[ROOK] | byTypeBB[QUEEN]);

  // X-ray may add already processed pieces because byTypeBB[] is constant: in
  // the rook example, now attackers contains _again_ rook in a7, so remove it.
  attackers &= occupied;
  return (PieceType)Pt;
}

template<>
PieceType min_attacker<KING>(const Bitboard*, Square, Bitboard, Bitboard&, Bitboard&) {
  return KING; // No need to update bitboards: it is the last cycle
}

#ifdef TWOKINGS
void two_kings_min_attacker(const Bitboard* byTypeBB, Square to, Bitboard stmAttackers,
                       Bitboard& occupied, Bitboard& attackers) {
  occupied ^= lsb(stmAttackers);
  attackers |= attacks_bb<BISHOP>(to, occupied) & (byTypeBB[BISHOP] | byTypeBB[QUEEN]);
  attackers |= attacks_bb<ROOK>(to, occupied) & (byTypeBB[ROOK] | byTypeBB[QUEEN]);
  attackers &= occupied;
}
#endif

} // namespace


/// operator<<(Position) returns an ASCII representation of the position

std::ostream& operator<<(std::ostream& os, const Position& pos) {

  os << "\n +---+---+---+---+---+---+---+---+\n";

  for (Rank r = RANK_8; r >= RANK_1; --r)
  {
      for (File f = FILE_A; f <= FILE_H; ++f)
          os << " | " << PieceToChar[pos.piece_on(make_square(f, r))];

      os << " |\n +---+---+---+---+---+---+---+---+\n";
  }

  os << "\nFen: " << pos.fen() << "\nKey: " << std::hex << std::uppercase
     << std::setfill('0') << std::setw(16) << pos.key()
     << std::setfill(' ') << std::dec << "\nCheckers: ";

  for (Bitboard b = pos.checkers(); b; )
      os << UCI::square(pop_lsb(&b)) << " ";

  if (    int(Tablebases::MaxCardinality) >= popcount(pos.pieces())
      && !pos.can_castle(ANY_CASTLING))
  {
      StateInfo st;
      Position p;
      p.set(pos.fen(), pos.is_chess960(), pos.subvariant(), &st, pos.this_thread());
      Tablebases::ProbeState s1, s2;
      Tablebases::WDLScore wdl = Tablebases::probe_wdl(p, &s1);
      int dtz = Tablebases::probe_dtz(p, &s2);
      os << "\nTablebases WDL: " << std::setw(4) << wdl << " (" << s1 << ")"
         << "\nTablebases DTZ: " << std::setw(4) << dtz << " (" << s2 << ")";
  }

  return os;
}


// Marcel van Kervinck's cuckoo algorithm for fast detection of "upcoming repetition"
// situations. Description of the algorithm in the following paper:
// https://marcelk.net/2013-04-06/paper/upcoming-rep-v2.pdf

// First and second hash functions for indexing the cuckoo tables
inline int H1(Key h) { return h & 0x1fff; }
inline int H2(Key h) { return (h >> 16) & 0x1fff; }

// Cuckoo tables with Zobrist hashes of valid reversible moves, and the moves themselves
Key cuckoo[8192];
Move cuckooMove[8192];


/// Position::init() initializes at startup the various arrays used to compute
/// hash keys.

void Position::init() {

  PRNG rng(1070372);

  for (Piece pc : Pieces)
      for (Square s = SQ_A1; s <= SQ_H8; ++s)
          Zobrist::psq[pc][s] = rng.rand<Key>();

  for (File f = FILE_A; f <= FILE_H; ++f)
      Zobrist::enpassant[f] = rng.rand<Key>();

  for (int cr = NO_CASTLING; cr <= ANY_CASTLING; ++cr)
  {
      Zobrist::castling[cr] = 0;
      Bitboard b = cr;
      while (b)
      {
          Key k = Zobrist::castling[1ULL << pop_lsb(&b)];
          Zobrist::castling[cr] ^= k ? k : rng.rand<Key>();
      }
  }

  Zobrist::side = rng.rand<Key>();
  Zobrist::noPawns = rng.rand<Key>();

  for (Variant var = CHESS_VARIANT; var < VARIANT_NB; ++var)
      Zobrist::variant[var] = var == CHESS_VARIANT ? 0 : rng.rand<Key>();

#ifdef THREECHECK
  for (Color c = WHITE; c <= BLACK; ++c)
      for (int n = 0; n < CHECKS_NB; ++n)
          Zobrist::checks[c][n] = rng.rand<Key>();
#endif
#ifdef CRAZYHOUSE
  for (Piece pc : Pieces)
      for (int n = 0; n < 17; ++n)
          Zobrist::inHand[pc][n] = rng.rand<Key>();
#endif

  // Prepare the cuckoo tables
  std::memset(cuckoo, 0, sizeof(cuckoo));
  std::memset(cuckooMove, 0, sizeof(cuckooMove));
  int count = 0;
  for (Piece pc : Pieces)
      for (Square s1 = SQ_A1; s1 <= SQ_H8; ++s1)
          for (Square s2 = Square(s1 + 1); s2 <= SQ_H8; ++s2)
              if (PseudoAttacks[type_of(pc)][s1] & s2)
              {
                  Move move = make_move(s1, s2);
                  Key key = Zobrist::psq[pc][s1] ^ Zobrist::psq[pc][s2] ^ Zobrist::side;
                  int i = H1(key);
                  while (true)
                  {
                      std::swap(cuckoo[i], key);
                      std::swap(cuckooMove[i], move);
                      if (move == 0)   // Arrived at empty slot ?
                          break;
                      i = (i == H1(key)) ? H2(key) : H1(key); // Push victim to alternative slot
                  }
                  count++;
             }
  assert(count == 3668);
}


/// Position::set() initializes the position object with the given FEN string.
/// This function is not very robust - make sure that input FENs are correct,
/// this is assumed to be the responsibility of the GUI.

Position& Position::set(const string& fenStr, bool isChess960, Variant v, StateInfo* si, Thread* th) {
/*
   A FEN string defines a particular position using only the ASCII character set.

   A FEN string contains six fields separated by a space. The fields are:

   1) Piece placement (from white's perspective). Each rank is described, starting
      with rank 8 and ending with rank 1. Within each rank, the contents of each
      square are described from file A through file H. Following the Standard
      Algebraic Notation (SAN), each piece is identified by a single letter taken
      from the standard English names. White pieces are designated using upper-case
      letters ("PNBRQK") whilst Black uses lowercase ("pnbrqk"). Blank squares are
      noted using digits 1 through 8 (the number of blank squares), and "/"
      separates ranks.

   2) Active color. "w" means white moves next, "b" means black.

   3) Castling availability. If neither side can castle, this is "-". Otherwise,
      this has one or more letters: "K" (White can castle kingside), "Q" (White
      can castle queenside), "k" (Black can castle kingside), and/or "q" (Black
      can castle queenside).

   4) En passant target square (in algebraic notation). If there's no en passant
      target square, this is "-". If a pawn has just made a 2-square move, this
      is the position "behind" the pawn. This is recorded only if there is a pawn
      in position to make an en passant capture, and if there really is a pawn
      that might have advanced two squares.

   5) Halfmove clock. This is the number of halfmoves since the last pawn advance
      or capture. This is used to determine if a draw can be claimed under the
      fifty-move rule.

   6) Fullmove number. The number of the full move. It starts at 1, and is
      incremented after Black's move.
*/

  unsigned char col, row, token;
  size_t idx;
  Square sq = SQ_A8;
  std::istringstream ss(fenStr);

  std::memset(this, 0, sizeof(Position));
  std::memset(si, 0, sizeof(StateInfo));
  std::fill_n(&pieceList[0][0], sizeof(pieceList) / sizeof(Square), SQ_NONE);
  st = si;
  subvar = v;
  var = main_variant(v);

  ss >> std::noskipws;

  // 1. Piece placement
  while ((ss >> token) && !isspace(token))
  {
      if (isdigit(token))
          sq += (token - '0') * EAST; // Advance the given number of files

      else if (token == '/')
      {
          sq += 2 * SOUTH;
#ifdef CRAZYHOUSE
          if (is_house() && sq < SQ_A1)
              break;
#endif
      }

      else if ((idx = PieceToChar.find(token)) != string::npos)
      {
          put_piece(Piece(idx), sq);
          ++sq;
      }
#ifdef CRAZYHOUSE
      // Set flag for promoted pieces
#ifdef LOOP
      else if (is_house() && !is_loop() && token == '~')
#else
      else if (is_house() && token == '~')
#endif
          promotedPieces |= SquareBB[sq - 1];
      // Stop before pieces in hand
      else if (is_house() && token == '[')
          break;
#endif
  }
#ifdef CRAZYHOUSE
  // Pieces in hand
  if (!isspace(token))
      while ((ss >> token) && !isspace(token))
      {
          if (token == ']')
              continue;
          else if ((idx = PieceToChar.find(token)) != string::npos)
              add_to_hand(color_of(Piece(idx)), type_of(Piece(idx)));
      }
#endif

  // 2. Active color
  ss >> token;
  sideToMove = (token == 'w' ? WHITE : BLACK);
  ss >> token;

  // 3. Castling availability. Compatible with 3 standards: Normal FEN standard,
  // Shredder-FEN that uses the letters of the columns on which the rooks began
  // the game instead of KQkq and also X-FEN standard that, in case of Chess960,
  // if an inner rook is associated with the castling right, the castling tag is
  // replaced by the file letter of the involved rook, as for the Shredder-FEN.
  while ((ss >> token) && !isspace(token))
  {
      Square rsq;
      Color c = islower(token) ? BLACK : WHITE;
#ifdef HORDE
      if (is_horde() && is_horde_color(c))
          continue;
#endif
      Rank rank = relative_rank(c, RANK_1);
      Square ksq = square<KING>(c);
#ifdef ANTI
      if (is_anti())
      {
#ifdef SUICIDE
          if (is_suicide())
              continue;
#endif
          // X-FEN is ambiguous if there are multiple kings
          // Assume the first king on the rank has castling rights
          const Square* kl = squares<KING>(c);
          while ((ksq = *kl++) != SQ_NONE)
          {
              assert(piece_on(ksq) == make_piece(c, KING));
              if (rank_of(ksq) == rank)
                  break;
          }
      }
#endif
#ifdef EXTINCTION
      if (is_extinction())
      {
          // X-FEN is ambiguous if there are multiple kings
          // Assume the first king on the rank has castling rights
          const Square* kl = squares<KING>(c);
          while ((ksq = *kl++) != SQ_NONE)
          {
              assert(piece_on(ksq) == make_piece(c, KING));
              if (rank_of(ksq) == rank)
                  break;
          }
      }
#endif
      if (rank_of(ksq) != rank)
          continue;
      Piece rook = make_piece(c, ROOK);

      token = char(toupper(token));

      if (token == 'K')
          for (rsq = relative_square(c, SQ_H1); rsq != ksq && piece_on(rsq) != rook; --rsq) {}

      else if (token == 'Q')
          for (rsq = relative_square(c, SQ_A1); rsq != ksq && piece_on(rsq) != rook; ++rsq) {}

      else if (token >= 'A' && token <= 'H')
          rsq = make_square(File(token - 'A'), rank);

      else
          continue;

      if (rsq != ksq)
          set_castling_right(c, ksq, rsq);
  }

  // 4. En passant square. Ignore if no pawn capture is possible
  if (((ss >> col) && (col >= 'a' && col <= 'h'))
        && ((ss >> row) && (sideToMove ? row == '3' : row == '6')))
  {
      st->epSquare = make_square(File(col - 'a'), Rank(row - '1'));

      if (   !(attackers_to(st->epSquare) & pieces(sideToMove, PAWN))
          || !(pieces(~sideToMove, PAWN) & (st->epSquare + pawn_push(~sideToMove))))
          st->epSquare = SQ_NONE;
      else if (SquareBB[st->epSquare] & pieces())
          st->epSquare = SQ_NONE;
      else if (sideToMove == WHITE && (shift<NORTH>(SquareBB[st->epSquare]) & pieces()))
          st->epSquare = SQ_NONE;
      else if (sideToMove == BLACK && (shift<SOUTH>(SquareBB[st->epSquare]) & pieces()))
          st->epSquare = SQ_NONE;
      else if (sideToMove == WHITE && !(shift<SOUTH>(SquareBB[st->epSquare]) & pieces(BLACK, PAWN)))
          st->epSquare = SQ_NONE;
      else if (sideToMove == BLACK && !(shift<NORTH>(SquareBB[st->epSquare]) & pieces(WHITE, PAWN)))
          st->epSquare = SQ_NONE;
#ifdef ATOMIC
      else if (is_atomic() && (attacks_from<KING>(st->epSquare) & square<KING>(sideToMove)))
          st->epSquare = SQ_NONE;
#endif
  }
  else
      st->epSquare = SQ_NONE;

#ifdef THREECHECK
  // Remaining checks counter for Three-Check positions
  st->checksGiven[WHITE] = CHECKS_0;
  st->checksGiven[BLACK] = CHECKS_0;

  ss >> std::skipws >> token;

  if (is_three_check() && ss.peek() == '+')
  {
      st->checksGiven[WHITE] = CheckCount(std::max(std::min('3' - token, 3), 0));
      ss >> token >> token;
      st->checksGiven[BLACK] = CheckCount(std::max(std::min('3' - token, 3), 0));
  }
  else
      ss.putback(token);
#endif

  // 5-6. Halfmove clock and fullmove number
  ss >> std::skipws >> st->rule50 >> gamePly;

#ifdef THREECHECK
  // Checks given in Three-Check positions
  if (is_three_check() && (ss >> token) && token == '+')
  {
      ss >> token;
      st->checksGiven[WHITE] = CheckCount(std::max(std::min(token - '0', 3), 0));
      ss >> token >> token;
      st->checksGiven[BLACK] = CheckCount(std::max(std::min(token - '0', 3), 0));
  }
#endif

  // Convert from fullmove starting from 1 to gamePly starting from 0,
  // handle also common incorrect FEN with fullmove = 0.
  gamePly = std::max(2 * (gamePly - 1), 0) + (sideToMove == BLACK);

  chess960 = isChess960;
  thisThread = th;
  set_state(st);

  assert(pos_is_ok());

  return *this;
}


/// Position::set_castling_right() is a helper function used to set castling
/// rights given the corresponding color and the rook starting square.

void Position::set_castling_right(Color c, Square kfrom, Square rfrom) {

  CastlingSide cs = kfrom < rfrom ? KING_SIDE : QUEEN_SIDE;
  CastlingRight cr = (c | cs);

  st->castlingRights |= cr;
  castlingRightsMask[kfrom] |= cr;
  castlingRightsMask[rfrom] |= cr;
#if defined(ANTI) || defined(EXTINCTION) || defined(TWOKINGS)
  castlingKingSquare[cr] = kfrom;
#endif
  castlingRookSquare[cr] = rfrom;

  Square kto = relative_square(c, cs == KING_SIDE ? SQ_G1 : SQ_C1);
  Square rto = relative_square(c, cs == KING_SIDE ? SQ_F1 : SQ_D1);

  for (Square s = std::min(rfrom, rto); s <= std::max(rfrom, rto); ++s)
      if (s != kfrom && s != rfrom)
          castlingPath[cr] |= s;

  for (Square s = std::min(kfrom, kto); s <= std::max(kfrom, kto); ++s)
      if (s != kfrom && s != rfrom)
          castlingPath[cr] |= s;
}


/// Position::set_check_info() sets king attacks to detect if a move gives check

void Position::set_check_info(StateInfo* si) const {

#ifdef ANTI
  if (is_anti())
  {
      si->blockersForKing[WHITE] = si->pinners[WHITE] = 0;
      si->blockersForKing[BLACK] = si->pinners[BLACK] = 0;
  }
  else
#endif
#ifdef ATOMIC
  if (is_atomic() && (is_atomic_loss() || kings_adjacent()))
  {
      si->blockersForKing[WHITE] = si->pinners[WHITE] = 0;
      si->blockersForKing[BLACK] = si->pinners[BLACK] = 0;
  }
  else
#endif
#ifdef EXTINCTION
  if (is_extinction())
  {
      si->blockersForKing[WHITE] = si->pinners[WHITE] = 0;
      si->blockersForKing[BLACK] = si->pinners[BLACK] = 0;
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      si->blockersForKing[WHITE] = si->pinners[WHITE] = is_horde_color(WHITE)
          ? 0 : slider_blockers(pieces(BLACK), square<KING>(WHITE), si->pinners[BLACK]);
      si->blockersForKing[BLACK] = si->pinners[BLACK] = is_horde_color(BLACK)
          ? 0 : slider_blockers(pieces(WHITE), square<KING>(BLACK), si->pinners[WHITE]);
  }
  else
#endif
  {
  si->blockersForKing[WHITE] = slider_blockers(pieces(BLACK), square<KING>(WHITE), si->pinners[BLACK]);
  si->blockersForKing[BLACK] = slider_blockers(pieces(WHITE), square<KING>(BLACK), si->pinners[WHITE]);
  }

#ifdef HORDE
  if (is_horde() && is_horde_color(~sideToMove)) {
  si->checkSquares[PAWN]   = 0;
  si->checkSquares[KNIGHT] = 0;
  si->checkSquares[BISHOP] = 0;
  si->checkSquares[ROOK]   = 0;
  si->checkSquares[QUEEN]  = 0;
  si->checkSquares[KING]   = 0;
  return;
  }
#endif
  Square ksq = square<KING>(~sideToMove);
#ifdef ANTI
  if (is_anti()) { // There are no checks in antichess
  si->checkSquares[PAWN]   = 0;
  si->checkSquares[KNIGHT] = 0;
  si->checkSquares[BISHOP] = 0;
  si->checkSquares[ROOK]   = 0;
  si->checkSquares[QUEEN]  = 0;
  si->checkSquares[KING]   = 0;
  return;
  }
#endif
#ifdef EXTINCTION
  if (is_extinction()) {
  si->checkSquares[PAWN]   = 0;
  si->checkSquares[KNIGHT] = 0;
  si->checkSquares[BISHOP] = 0;
  si->checkSquares[ROOK]   = 0;
  si->checkSquares[QUEEN]  = 0;
  si->checkSquares[KING]   = 0;
  return;
  }
#endif
#ifdef GRID
  if (is_grid()) {
  si->checkSquares[PAWN]   = attacks_from<PAWN>(ksq, ~sideToMove) & ~grid_bb(ksq);
  si->checkSquares[KNIGHT] = attacks_from<KNIGHT>(ksq) & ~grid_bb(ksq);
  si->checkSquares[BISHOP] = attacks_from<BISHOP>(ksq) & ~grid_bb(ksq);
  si->checkSquares[ROOK]   = attacks_from<ROOK>(ksq) & ~grid_bb(ksq);
  si->checkSquares[QUEEN]  = (si->checkSquares[BISHOP] | si->checkSquares[ROOK]) & ~grid_bb(ksq);
  si->checkSquares[KING]   = 0;
  return;
  }
#endif
#ifdef ATOMIC
  if (is_atomic() && ksq == SQ_NONE) {
  si->checkSquares[PAWN]   = 0;
  si->checkSquares[KNIGHT] = 0;
  si->checkSquares[BISHOP] = 0;
  si->checkSquares[ROOK]   = 0;
  si->checkSquares[QUEEN]  = 0;
  si->checkSquares[KING]   = 0;
  return;
  }
#endif
  si->checkSquares[PAWN]   = attacks_from<PAWN>(ksq, ~sideToMove);
  si->checkSquares[KNIGHT] = attacks_from<KNIGHT>(ksq);
  si->checkSquares[BISHOP] = attacks_from<BISHOP>(ksq);
  si->checkSquares[ROOK]   = attacks_from<ROOK>(ksq);
  si->checkSquares[QUEEN]  = si->checkSquares[BISHOP] | si->checkSquares[ROOK];
#ifdef TWOKINGS
  if (is_two_kings())
      si->checkSquares[KING] = attacks_from<KING>(ksq);
  else
#endif
  si->checkSquares[KING]   = 0;
}


/// Position::set_state() computes the hash keys of the position, and other
/// data that once computed is updated incrementally as moves are made.
/// The function is only used when a new position is set up, and to verify
/// the correctness of the StateInfo data when running in debug mode.

void Position::set_state(StateInfo* si) const {

  si->key = si->materialKey = Zobrist::variant[var];
  si->pawnKey = Zobrist::noPawns;
  si->nonPawnMaterial[WHITE] = si->nonPawnMaterial[BLACK] = VALUE_ZERO;

  set_check_info(si);
#ifdef HORDE
  if (is_horde() && is_horde_color(sideToMove))
      si->checkersBB = 0;
  else
#endif
#ifdef ANTI
  if (is_anti())
      si->checkersBB = 0;
  else
#endif
#ifdef EXTINCTION
  if (is_extinction())
      si->checkersBB = 0;
  else
#endif
#ifdef ATOMIC
  if (is_atomic() && (is_atomic_loss() || kings_adjacent()))
      si->checkersBB = 0;
  else
#endif
  {
      si->checkersBB = attackers_to(square<KING>(sideToMove)) & pieces(~sideToMove);
  }

  for (Bitboard b = pieces(); b; )
  {
      Square s = pop_lsb(&b);
      Piece pc = piece_on(s);
      si->key ^= Zobrist::psq[pc][s];
  }

  if (si->epSquare != SQ_NONE)
      si->key ^= Zobrist::enpassant[file_of(si->epSquare)];

  if (sideToMove == BLACK)
      si->key ^= Zobrist::side;

  si->key ^= Zobrist::castling[si->castlingRights];

  for (Bitboard b = pieces(PAWN); b; )
  {
      Square s = pop_lsb(&b);
      si->pawnKey ^= Zobrist::psq[piece_on(s)][s];
  }

  for (Piece pc : Pieces)
  {
      if (type_of(pc) != PAWN && type_of(pc) != KING)
          si->nonPawnMaterial[color_of(pc)] += pieceCount[pc] * PieceValue[CHESS_VARIANT][MG][pc];

      for (int cnt = 0; cnt < pieceCount[pc]; ++cnt)
          si->materialKey ^= Zobrist::psq[pc][cnt];

#ifdef CRAZYHOUSE
      if (is_house())
      {
          if (type_of(pc) != PAWN && type_of(pc) != KING)
              si->nonPawnMaterial[color_of(pc)] += pieceCountInHand[color_of(pc)][type_of(pc)] * PieceValue[CHESS_VARIANT][MG][pc];
          si->key ^= Zobrist::inHand[pc][pieceCountInHand[color_of(pc)][type_of(pc)]];
      }
#endif
  }

#ifdef THREECHECK
  if (is_three_check())
      for (Color c = WHITE; c <= BLACK; ++c)
          si->key ^= Zobrist::checks[c][si->checksGiven[c]];
#endif
}


/// Position::set() is an overload to initialize the position object with
/// the given endgame code string like "KBPvKN". It is mainly a helper to
/// get the material key out of an endgame code.

Position& Position::set(const string& code, Color c, Variant v, StateInfo* si) {

  assert(code.length() > 0 && code.length() < 9);

  string sides[] = { code.substr(code.find('v') + 1),  // Weak
                     code.substr(0, code.find('v')) }; // Strong

  std::transform(sides[c].begin(), sides[c].end(), sides[c].begin(), tolower);

  string fenStr = "8/" + sides[0] + char(8 - sides[0].length() + '0') + "/8/8/8/8/"
                       + sides[1] + char(8 - sides[1].length() + '0') + "/8 w - - 0 10";

  return set(fenStr, false, v, si, nullptr);
}


/// Position::fen() returns a FEN representation of the position. In case of
/// Chess960 the Shredder-FEN notation is used. This is mainly a debugging function.

const string Position::fen() const {

  int emptyCnt;
  std::ostringstream ss;

  for (Rank r = RANK_8; r >= RANK_1; --r)
  {
      for (File f = FILE_A; f <= FILE_H; ++f)
      {
          for (emptyCnt = 0; f <= FILE_H && empty(make_square(f, r)); ++f)
              ++emptyCnt;

          if (emptyCnt)
              ss << emptyCnt;

          if (f <= FILE_H)
          {
              ss << PieceToChar[piece_on(make_square(f, r))];
#ifdef CRAZYHOUSE
              // Set promoted pieces
              if (is_house() && is_promoted(make_square(f, r)))
                  ss << "~";
#endif
          }
      }

      if (r > RANK_1)
          ss << '/';
  }

#ifdef CRAZYHOUSE
  // pieces in hand
  if (is_house())
  {
      ss << '[';
      for (Color c = WHITE; c <= BLACK; ++c)
          for (PieceType pt = QUEEN; pt >= PAWN; --pt)
              ss << std::string(pieceCountInHand[c][pt], PieceToChar[make_piece(c, pt)]);
      ss << ']';
  }
#endif

  ss << (sideToMove == WHITE ? " w " : " b ");

  if (can_castle(WHITE_OO))
      ss << (chess960 ? char('A' + file_of(castling_rook_square(WHITE |  KING_SIDE))) : 'K');

  if (can_castle(WHITE_OOO))
      ss << (chess960 ? char('A' + file_of(castling_rook_square(WHITE | QUEEN_SIDE))) : 'Q');

  if (can_castle(BLACK_OO))
      ss << (chess960 ? char('a' + file_of(castling_rook_square(BLACK |  KING_SIDE))) : 'k');

  if (can_castle(BLACK_OOO))
      ss << (chess960 ? char('a' + file_of(castling_rook_square(BLACK | QUEEN_SIDE))) : 'q');

  if (!can_castle(WHITE) && !can_castle(BLACK))
      ss << '-';

  ss << (ep_square() == SQ_NONE ? " - " : " " + UCI::square(ep_square()) + " ");
#ifdef THREECHECK
  if (is_three_check())
      ss << (CHECKS_3 - st->checksGiven[WHITE]) << "+" << (CHECKS_3 - st->checksGiven[BLACK]) << " ";
#endif
  ss << st->rule50 << " " << 1 + (gamePly - (sideToMove == BLACK)) / 2;


  return ss.str();
}


/// Position::slider_blockers() returns a bitboard of all the pieces (both colors)
/// that are blocking attacks on the square 's' from 'sliders'. A piece blocks a
/// slider if removing that piece from the board would result in a position where
/// square 's' is attacked. For example, a king-attack blocking piece can be either
/// a pinned or a discovered check piece, according if its color is the opposite
/// or the same of the color of the slider.

Bitboard Position::slider_blockers(Bitboard sliders, Square s, Bitboard& pinners) const {

  Bitboard blockers = 0;
  pinners = 0;

  // Snipers are sliders that attack 's' when a piece is removed
  Bitboard snipers = (  (PseudoAttacks[  ROOK][s] & pieces(QUEEN, ROOK))
                      | (PseudoAttacks[BISHOP][s] & pieces(QUEEN, BISHOP))) & sliders;

  while (snipers)
  {
    Square sniperSq = pop_lsb(&snipers);
    Bitboard b = between_bb(s, sniperSq) & pieces();

    if (b && !more_than_one(b))
    {
        blockers |= b;
        if (b & pieces(color_of(piece_on(s))))
            pinners |= sniperSq;
    }
  }
  return blockers;
}


/// Position::attackers_to() computes a bitboard of all pieces which attack a
/// given square. Slider attacks use the occupied bitboard to indicate occupancy.

Bitboard Position::attackers_to(Square s, Bitboard occupied) const {

#ifdef GRID
  if (is_grid())
      return  (  (attacks_from<PAWN>(s, BLACK)    & pieces(WHITE, PAWN))
               | (attacks_from<PAWN>(s, WHITE)    & pieces(BLACK, PAWN))
               | (attacks_from<KNIGHT>(s)         & pieces(KNIGHT))
               | (attacks_bb<  ROOK>(s, occupied) & pieces(  ROOK, QUEEN))
               | (attacks_bb<BISHOP>(s, occupied) & pieces(BISHOP, QUEEN))
               | (attacks_from<KING>(s)           & pieces(KING)))
             & ~grid_bb(s);
#endif
  return  (attacks_from<PAWN>(s, BLACK)    & pieces(WHITE, PAWN))
        | (attacks_from<PAWN>(s, WHITE)    & pieces(BLACK, PAWN))
        | (attacks_from<KNIGHT>(s)         & pieces(KNIGHT))
        | (attacks_bb<  ROOK>(s, occupied) & pieces(  ROOK, QUEEN))
        | (attacks_bb<BISHOP>(s, occupied) & pieces(BISHOP, QUEEN))
        | (attacks_from<KING>(s)           & pieces(KING));
}

#ifdef ATOMIC
Bitboard Position::slider_attackers_to(Square s, Bitboard occupied) const {

  return  (attacks_bb<  ROOK>(s, occupied) & pieces(  ROOK, QUEEN))
        | (attacks_bb<BISHOP>(s, occupied) & pieces(BISHOP, QUEEN));
}
#endif

/// Position::legal() tests whether a pseudo-legal move is legal

bool Position::legal(Move m) const {

#ifdef CRAZYHOUSE
  assert(is_house() || type_of(m) != DROP);
#endif
  assert(is_ok(m));

  Color us = sideToMove;
  Square from = from_sq(m);

  assert(color_of(moved_piece(m)) == us);
#ifdef ANTI
  // If a player can capture, that player must capture
  // Is handled by move generator
  assert(!is_anti() || capture(m) == can_capture());
  if (is_anti())
      return true;
#endif
#ifdef EXTINCTION
  // All pseudo-legal moves in extinction chess are legal
  if (is_extinction())
      return true;
#endif
#ifdef GRID
  // For simplicity, we only check here that moves cross grid lines
  if (is_grid() && (grid_bb(from) & to_sq(m)))
      return false;
#endif
#ifdef HORDE
  assert((is_horde() && is_horde_color(us)) || piece_on(square<KING>(us)) == make_piece(us, KING));
#else
  assert(piece_on(square<KING>(us)) == make_piece(us, KING));
#endif
#ifdef LOSERS
  assert(!(is_losers() && !capture(m) && can_capture_losers()));
#endif

#ifdef RACE
  // Checking moves are illegal
  if (is_race() && gives_check(m))
      return false;
#endif
#ifdef HORDE
  // All pseudo-legal moves by the horde are legal
  if (is_horde() && is_horde_color(us))
      return true;
#endif
#ifdef ATOMIC
  if (is_atomic())
  {
      Square ksq = square<KING>(us);
      Square to = to_sq(m);

      assert(!capture(m) || !(attacks_from<KING>(to) & ksq));
      if (type_of(piece_on(from)) != KING)
      {
          if (attacks_from<KING>(square<KING>(~us)) & ksq)
              return true;
          if (capture(m))
          {
              Square capsq = type_of(m) == ENPASSANT ? make_square(file_of(to), rank_of(from)) : to;
              Bitboard blast = attacks_from<KING>(to) & (pieces() ^ pieces(PAWN));

              if (blast & square<KING>(~us))
                  return true;
              Bitboard b = pieces() ^ ((blast | capsq) | from);

              if (checkers() & b)
                  return false;
              if ((attacks_bb<  ROOK>(ksq, b) & pieces(~us, QUEEN, ROOK) & b) ||
                  (attacks_bb<BISHOP>(ksq, b) & pieces(~us, QUEEN, BISHOP) & b))
                  return false;
              return true;
          }
      }
      else if (attacks_from<KING>(square<KING>(~us)) & to)
          return true;
  }
#endif

  // En passant captures are a tricky special case. Because they are rather
  // uncommon, we do it simply by testing whether the king is attacked after
  // the move is made.
  if (type_of(m) == ENPASSANT)
  {
      Square ksq = square<KING>(us);
      Square to = to_sq(m);
      Square capsq = to - pawn_push(us);
      Bitboard occupied = (pieces() ^ from ^ capsq) | to;

      assert(to == ep_square());
      assert(moved_piece(m) == make_piece(us, PAWN));
      assert(piece_on(capsq) == make_piece(~us, PAWN));
      assert(piece_on(to) == NO_PIECE);

#ifdef GRID
      if (is_grid())
          return   !(attacks_bb<  ROOK>(ksq, occupied) & pieces(~us, QUEEN, ROOK) & ~grid_bb(ksq))
                && !(attacks_bb<BISHOP>(ksq, occupied) & pieces(~us, QUEEN, BISHOP) & ~grid_bb(ksq));
#endif
      return   !(attacks_bb<  ROOK>(ksq, occupied) & pieces(~us, QUEEN, ROOK))
            && !(attacks_bb<BISHOP>(ksq, occupied) & pieces(~us, QUEEN, BISHOP));
  }

#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      return pieceCountInHand[us][type_of(moved_piece(m))] && empty(to_sq(m));
#endif

#ifdef ATOMIC
  if (is_atomic() && type_of(piece_on(from)) == KING && type_of(m) != CASTLING)
  {
      Square to = to_sq(m);
      if (kings_adjacent() && !(attacks_from<KING>(square<KING>(~us)) & to))
      {
          if (attackers_to(to) & pieces(~us, KNIGHT, PAWN))
              return false;
          return !(slider_attackers_to(to, (pieces() ^ from) | to) & pieces(~us));
      }
  }
#endif

  // If the moving piece is a king, check whether the destination
  // square is attacked by the opponent. Castling moves are checked
  // for legality during move generation.
  if (type_of(piece_on(from)) == KING)
  {
#ifdef TWOKINGS
      if (is_two_kings())
      {
          Square to = to_sq(m);
          if (type_of(m) == CASTLING)
              to = make_square(to >= from ? FILE_G : FILE_C, rank_of(from));
          Square ksq = royal_king(us, pieces(us, KING) ^ from ^ to);
          return !(attackers_to(ksq, (pieces() ^ from) | to) & (pieces(~us) - to));
      }
#endif
#ifdef GRID
      // We have to take into account here that pieces can give check by moving away from the king
      if (is_grid())
          return type_of(m) == CASTLING || !(attackers_to(to_sq(m), pieces() ^ from) & pieces(~us));
#endif
      return type_of(m) == CASTLING || !(attackers_to(to_sq(m)) & pieces(~us));
  }

  // A non-king move is legal if and only if it is not pinned or it
  // is moving along the ray towards or away from the king.
  return   !(blockers_for_king(us) & from)
        ||  aligned(from, to_sq(m), square<KING>(us));
}


/// Position::pseudo_legal() takes a random move and tests whether the move is
/// pseudo legal. It is used to validate moves from TT that can be corrupted
/// due to SMP concurrent access or hash position key aliasing.

bool Position::pseudo_legal(const Move m) const {

#ifdef CRAZYHOUSE
  // Early return on TT move which does not apply for this variant
  if (!is_house() && type_of(m) == DROP)
      return false;
#endif

  Color us = sideToMove;
  Square from = from_sq(m);
  Square to = to_sq(m);
  Piece pc = moved_piece(m);

  // If the game is already won or lost, further moves are illegal
  if (is_variant_end())
      return false;

#ifdef ATOMIC
  if (is_atomic())
  {
      // If the game is already won or lost, further moves are illegal
      if (pc == NO_PIECE || color_of(pc) != us)
          return false;
      if (capture(m))
      {
          if (type_of(pc) == KING)
              return false;
          Square ksq = square<KING>(us);

          if ((pieces(us) & to) || (attacks_from<KING>(ksq) & to))
              return false;
          if (!(attacks_from<KING>(square<KING>(~us)) & ksq))
          {
              // Illegal pawn capture generated by killer move heuristic
              if (type_of(pc) == PAWN && file_of(from) == file_of(to))
                 return false;
              Square capsq = type_of(m) == ENPASSANT ? make_square(file_of(to), rank_of(from)) : to;

              if (!(attacks_from<KING>(to) & square<KING>(~us)))
              {
                  Bitboard blast = attacks_from<KING>(to) & (pieces() ^ pieces(PAWN));
                  Bitboard b = pieces() ^ ((blast | capsq) | from);

                  if (checkers() & b)
                      return false;
                  if ((attacks_bb<  ROOK>(ksq, b) & pieces(~us, QUEEN, ROOK) & b) ||
                      (attacks_bb<BISHOP>(ksq, b) & pieces(~us, QUEEN, BISHOP) & b))
                      return false;
              }
          }
      }
  }
#endif
#ifdef ANTI
  if (is_anti() && !capture(m) && can_capture())
      return false;
#endif
#ifdef LOSERS
  if (is_losers() && !capture(m) && can_capture_losers())
      return false;
#endif

  // Use a slower but simpler function for uncommon cases
#ifdef CRAZYHOUSE
  if (type_of(m) != NORMAL && type_of(m) != DROP)
#else
  if (type_of(m) != NORMAL)
#endif
      return MoveList<LEGAL>(*this).contains(m);

  // Is not a promotion, so promotion piece must be empty
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      assert(promotion_type(m) - KNIGHT == 1);
  else
#endif
  if (promotion_type(m) - KNIGHT != NO_PIECE_TYPE)
      return false;

  // If the 'from' square is not occupied by a piece belonging to the side to
  // move, the move is obviously not legal.
  if (pc == NO_PIECE || color_of(pc) != us)
      return false;

  // The destination square cannot be occupied by a friendly piece
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP && (!pieceCountInHand[us][type_of(pc)] || !empty(to)))
      return false;
  else
#endif
  if (pieces(us) & to)
      return false;

  // Handle the special case of a pawn move
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP) {} else
#endif
  if (type_of(pc) == PAWN)
  {
      // We have already handled promotion moves, so destination
      // cannot be on the 8th/1st rank.
      if (rank_of(to) == relative_rank(us, RANK_8))
          return false;

      if (   !(attacks_from<PAWN>(from, us) & pieces(~us) & to) // Not a capture
          && !((from + pawn_push(us) == to) && empty(to))       // Not a single push
          && !(   (from + 2 * pawn_push(us) == to)              // Not a double push
               && (rank_of(from) == relative_rank(us, RANK_2))
               && empty(to)
               && empty(to - pawn_push(us))))
          return false;
  }
  else if (!(attacks_from(type_of(pc), from) & to))
      return false;

  // Evasions generator already takes care to avoid some kind of illegal moves
  // and legal() relies on this. We therefore have to take care that the same
  // kind of moves are filtered out here.
#ifdef ATOMIC
  // In case of adjacent kings or moves that capture the king, we can ignore attacks on our king
  if (is_atomic())
  {
      if (attacks_from<KING>(square<KING>(~us)) & (type_of(pc) == KING ? to : square<KING>(us)))
          return true;
      if (capture(m) && (attacks_from<KING>(square<KING>(~us)) & to))
          return true;
  }
#endif
  if (checkers())
  {
      if (type_of(pc) != KING)
      {
          // Double check? In this case a king move is required
          if (more_than_one(checkers()))
              return false;

          // Our move must be a blocking evasion or a capture of the checking piece
          if (!((between_bb(lsb(checkers()), square<KING>(us)) | checkers()) & to))
              return false;
      }
      // In case of king moves under check we have to remove king so as to catch
      // invalid moves like b1a1 when opposite queen is on c1.
#ifdef GRID
      else if (is_grid() && (attackers_to(to, pieces() ^ from) & pieces(~us) & grid_bb(to)))
          return false;
#endif
      else if (attackers_to(to, pieces() ^ from) & pieces(~us))
          return false;
  }

  return true;
}


/// Position::gives_check() tests whether a pseudo-legal move gives a check

bool Position::gives_check(Move m) const {

  assert(is_ok(m));
  assert(color_of(moved_piece(m)) == sideToMove);

  Square from = from_sq(m);
  Square to = to_sq(m);

#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      return st->checkSquares[type_of(dropped_piece(m))] & to;
#endif
#ifdef HORDE
  if (is_horde() && is_horde_color(~sideToMove))
      return false;
#endif
#ifdef ANTI
  if (is_anti())
      return false;
#endif
#ifdef EXTINCTION
  if (is_extinction())
      return false;
#endif
#ifdef ATOMIC
  if (is_atomic())
  {
      // Separating adjacent kings exposes direct checks (minus castle rook)
      // For simplicity, resolves castling discovered checks by fall-through
      Square ksq = square<KING>(~sideToMove);
      Bitboard attacks = attacks_from<KING>(ksq);

      switch (type_of(m))
      {
      case CASTLING:
          if (!(attacks & square<KING>(sideToMove)) || relative_rank(sideToMove, ksq) == RANK_1)
              break;
          if (attacks & relative_square(sideToMove, to > from ? SQ_G1 : SQ_C1))
              return false;
          return attackers_to(ksq) & (pieces(sideToMove) ^ from ^ to);

      default:
          if (attacks & (type_of(piece_on(from)) == KING ? to : square<KING>(sideToMove)))
              return false;
          if (type_of(piece_on(from)) == KING && kings_adjacent())
              return attackers_to(ksq, pieces() ^ from ^ to) & (pieces(sideToMove) ^ from);
          if (capture(m))
          {
              if (attacks & to) // Variant ending
                  return false;
              // Blasted pieces may discover checks
              Bitboard blast = attacks_from<KING>(to) & (pieces() ^ pieces(PAWN));
              blast |= type_of(m) == ENPASSANT ? make_square(file_of(to), rank_of(from)) : to;

              return slider_attackers_to(ksq, pieces() ^ (blast | from)) & (pieces(sideToMove) ^ from) & ~blast;
          }
      }
  }
#endif

  // Is there a direct check?
  if (st->checkSquares[type_of(piece_on(from))] & to)
      return true;

  // Is there a discovered check?
  if (   (st->blockersForKing[~sideToMove] & from)
      && !aligned(from, to, square<KING>(~sideToMove)))
      return true;
#ifdef GRID
  // Does the piece give check by moving away from king?
  if (   is_grid()
      && (grid_bb(square<KING>(~sideToMove)) & from)
      && aligned(from, to, square<KING>(~sideToMove))
      && type_of(piece_on(from)) != PAWN
      && (attacks_bb(type_of(piece_on(from)), to, pieces() ^ from) & square<KING>(~sideToMove)))
      return true;
#endif

  switch (type_of(m))
  {
  case NORMAL:
      return false;

  case PROMOTION:
#ifdef GRID
      if (is_grid())
          return attacks_bb(promotion_type(m), to, pieces() ^ from) & square<KING>(~sideToMove) & ~grid_bb(to);
#endif
      return attacks_bb(promotion_type(m), to, pieces() ^ from) & square<KING>(~sideToMove);

  // En passant capture with check? We have already handled the case
  // of direct checks and ordinary discovered check, so the only case we
  // need to handle is the unusual case of a discovered check through
  // the captured pawn.
  case ENPASSANT:
  {
      Square capsq = make_square(file_of(to), rank_of(from));
      Bitboard b = (pieces() ^ from ^ capsq) | to;

#ifdef GRID
      if (is_grid())
          return ((attacks_bb<  ROOK>(square<KING>(~sideToMove), b) & pieces(sideToMove, QUEEN, ROOK))
                | (attacks_bb<BISHOP>(square<KING>(~sideToMove), b) & pieces(sideToMove, QUEEN, BISHOP))) & ~grid_bb(square<KING>(~sideToMove));
#endif
      return  (attacks_bb<  ROOK>(square<KING>(~sideToMove), b) & pieces(sideToMove, QUEEN, ROOK))
            | (attacks_bb<BISHOP>(square<KING>(~sideToMove), b) & pieces(sideToMove, QUEEN, BISHOP));
  }
  case CASTLING:
  {
      Square kfrom = from;
      Square rfrom = to; // Castling is encoded as 'King captures the rook'
      Square kto = relative_square(sideToMove, rfrom > kfrom ? SQ_G1 : SQ_C1);
      Square rto = relative_square(sideToMove, rfrom > kfrom ? SQ_F1 : SQ_D1);

#ifdef GRID
      if (is_grid())
          return   (PseudoAttacks[ROOK][rto] & square<KING>(~sideToMove) & ~grid_bb(rto))
                && (attacks_bb<ROOK>(rto, (pieces() ^ kfrom ^ rfrom) | rto | kto) & square<KING>(~sideToMove));
#endif
      return   (PseudoAttacks[ROOK][rto] & square<KING>(~sideToMove))
            && (attacks_bb<ROOK>(rto, (pieces() ^ kfrom ^ rfrom) | rto | kto) & square<KING>(~sideToMove));
  }
  default:
      assert(false);
      return false;
  }
}

/// Position::do_move() makes a move, and saves all information necessary
/// to a StateInfo object. The move is assumed to be legal. Pseudo-legal
/// moves should be filtered out before this function is called.

void Position::do_move(Move m, StateInfo& newSt, bool givesCheck) {

  assert(is_ok(m));
  assert(&newSt != st);
#ifdef ANTI
  assert(!is_anti() || !givesCheck);
#endif
#ifdef EXTINCTION
  assert(!is_extinction() || !givesCheck);
#endif

  thisThread->nodes.fetch_add(1, std::memory_order_relaxed);
  Key k = st->key ^ Zobrist::side;

  // Copy some fields of the old state to our new StateInfo object except the
  // ones which are going to be recalculated from scratch anyway and then switch
  // our state pointer to point to the new (ready to be updated) state.
  std::memcpy(&newSt, st, offsetof(StateInfo, key));
  newSt.previous = st;
  st = &newSt;

  // Increment ply counters. In particular, rule50 will be reset to zero later on
  // in case of a capture or a pawn move.
  ++gamePly;
  ++st->rule50;
  ++st->pliesFromNull;

  Color us = sideToMove;
  Color them = ~us;
  Square from = from_sq(m);
  Square to = to_sq(m);
#ifdef CRAZYHOUSE
  Piece pc = is_house() && type_of(m) == DROP ? dropped_piece(m) : piece_on(from);
#else
  Piece pc = piece_on(from);
#endif
  Piece captured = type_of(m) == ENPASSANT ? make_piece(them, PAWN) : piece_on(to);

  assert(color_of(pc) == us);
  assert(captured == NO_PIECE || color_of(captured) == (type_of(m) != CASTLING ? them : us));

#ifdef ANTI
  if (is_anti()) {} else
#endif
#ifdef EXTINCTION
  if (is_extinction()) {} else
#endif
#ifdef TWOKINGS
  if (is_two_kings()) {} else
#endif
  {
  assert(type_of(captured) != KING);
  }

  if (type_of(m) == CASTLING)
  {
      assert(pc == make_piece(us, KING));
      assert(captured == make_piece(us, ROOK));

      Square rfrom, rto;
      do_castling<true>(us, from, to, rfrom, rto);

      k ^= Zobrist::psq[captured][rfrom] ^ Zobrist::psq[captured][rto];
      captured = NO_PIECE;
  }

  if (captured)
  {
      Square capsq = to;

      // If the captured piece is a pawn, update pawn hash key, otherwise
      // update non-pawn material.
      if (type_of(captured) == PAWN)
      {
          if (type_of(m) == ENPASSANT)
          {
              capsq -= pawn_push(us);

              assert(pc == make_piece(us, PAWN));
              assert(to == st->epSquare);
              assert(relative_rank(us, to) == RANK_6);
              assert(piece_on(to) == NO_PIECE);
              assert(piece_on(capsq) == make_piece(them, PAWN));

              board[capsq] = NO_PIECE; // Not done by remove_piece()
          }

          st->pawnKey ^= Zobrist::psq[captured][capsq];
      }
      else
      {
          st->nonPawnMaterial[them] -= PieceValue[CHESS_VARIANT][MG][captured];
#ifdef CRAZYHOUSE
          if (is_house() && !is_promoted(to))
          {
#ifdef BUGHOUSE
              if (! is_bughouse())
#endif
              {
                  st->nonPawnMaterial[us] += PieceValue[CHESS_VARIANT][MG][captured];
              }
          }
#endif
      }

      // Update board and piece lists
      remove_piece(captured, capsq);
#ifdef CRAZYHOUSE
      if (is_house())
      {
          st->capturedpromoted = is_promoted(to);
#ifdef BUGHOUSE
          if (! is_bughouse())
#endif
          {
              Piece add = is_promoted(to) ? make_piece(~color_of(captured), PAWN) : ~captured;
              add_to_hand(color_of(add), type_of(add));
              k ^= Zobrist::inHand[add][pieceCountInHand[color_of(add)][type_of(add)] - 1]
                  ^ Zobrist::inHand[add][pieceCountInHand[color_of(add)][type_of(add)]];
          }
          promotedPieces -= to;
      }
#endif

      // Update material hash key and prefetch access to materialTable
      k ^= Zobrist::psq[captured][capsq];
      st->materialKey ^= Zobrist::psq[captured][pieceCount[captured]];
#ifdef ATOMIC
      if (is_atomic()) // Remove the blast piece(s)
      {
          Bitboard blast = attacks_from<KING>(to) - from;
          while (blast)
          {
              Square bsq = pop_lsb(&blast);
              Piece bpc = piece_on(bsq);
              st->blast[bsq] = bpc;
              if (bpc != NO_PIECE && type_of(bpc) != PAWN)
              {
                  Color bc = color_of(st->blast[bsq]);
                  st->nonPawnMaterial[bc] -= PieceValue[CHESS_VARIANT][MG][type_of(bpc)];

                  // Update board and piece lists
                  remove_piece(bpc, bsq);

                  // Update material hash key
                  k ^= Zobrist::psq[bpc][bsq];
                  st->materialKey ^= Zobrist::psq[bpc][pieceCount[bpc]];

                  // Update castling rights if needed
                  if (st->castlingRights && castlingRightsMask[bsq])
                  {
                      int cr = castlingRightsMask[bsq];
                      k ^= Zobrist::castling[st->castlingRights & cr];
                      st->castlingRights &= ~cr;
                  }
              }
          }
      }
#endif

      prefetch(thisThread->materialTable[st->materialKey]);

      // Reset rule 50 counter
      st->rule50 = 0;
  }

#ifdef ATOMIC
  if (is_atomic() && captured)
      k ^= Zobrist::psq[pc][from];
  else
#endif
  // Update hash key
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      k ^=  Zobrist::psq[pc][to] ^ Zobrist::inHand[pc][pieceCountInHand[color_of(pc)][type_of(pc)] - 1]
          ^ Zobrist::inHand[pc][pieceCountInHand[color_of(pc)][type_of(pc)]];
  else
#endif
  k ^= Zobrist::psq[pc][from] ^ Zobrist::psq[pc][to];

  // Reset en passant square
  if (st->epSquare != SQ_NONE)
  {
      k ^= Zobrist::enpassant[file_of(st->epSquare)];
      st->epSquare = SQ_NONE;
  }

  // Update castling rights if needed
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP) {} else
#endif
  if (st->castlingRights && (castlingRightsMask[from] | castlingRightsMask[to]))
  {
      int cr = castlingRightsMask[from] | castlingRightsMask[to];
      k ^= Zobrist::castling[st->castlingRights & cr];
      st->castlingRights &= ~cr;
  }
#ifdef TWOKINGS
  // Moving any king loses the castling rights
  else if (st->castlingRights && type_of(pc) == KING)
  {
      int cr = castlingRightsMask[square<KING>(us)];
      k ^= Zobrist::castling[st->castlingRights & cr];
      st->castlingRights &= ~cr;
  }
#endif

#ifdef THREECHECK
  if (is_three_check() && givesCheck)
  {
      k ^= Zobrist::checks[us][st->checksGiven[us]];
      CheckCount checksGiven = ++(st->checksGiven[us]);
      assert(checksGiven < CHECKS_NB);
      k ^= Zobrist::checks[us][checksGiven];
  }
#endif

#ifdef ATOMIC
  if (is_atomic() && captured) // Remove the blast piece(s)
  {
      st->blast[from] = piece_on(from);
      remove_piece(pc, from);
      // Update material (hash key already updated)
      st->materialKey ^= Zobrist::psq[pc][pieceCount[pc]];
      if (type_of(pc) != PAWN)
          st->nonPawnMaterial[us] -= PieceValue[CHESS_VARIANT][MG][type_of(pc)];
  }
  else
#endif
  // Move the piece. The tricky Chess960 castling is handled earlier
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
  {
      drop_piece(pc, to);
      st->materialKey ^= Zobrist::psq[pc][pieceCount[pc]-1];
  }
  else
#endif
  if (type_of(m) != CASTLING)
      move_piece(pc, from, to);

  // If the moving piece is a pawn do some special extra work
  if (type_of(pc) == PAWN)
  {
      // Set en-passant square if the moved pawn can be captured
#ifdef HORDE
      if (is_horde() && rank_of(from) == relative_rank(us, RANK_1)) {} else
#endif
      if (   (int(to) ^ int(from)) == 16
#ifdef ATOMIC
          && !(is_atomic() && (attacks_from<KING>(to - pawn_push(us)) & square<KING>(them)))
#endif
          && (attacks_from<PAWN>(to - pawn_push(us), us) & pieces(them, PAWN)))
      {
          st->epSquare = to - pawn_push(us);
          k ^= Zobrist::enpassant[file_of(st->epSquare)];
      }
#ifdef ATOMIC
      else if (!(is_atomic() && captured) && type_of(m) == PROMOTION)
#else
      else if (type_of(m) == PROMOTION)
#endif
      {
          Piece promotion = make_piece(us, promotion_type(m));

          assert(relative_rank(us, to) == RANK_8);

#ifdef ANTI
#ifdef EXTINCTION
          assert(type_of(promotion) >= KNIGHT && type_of(promotion) <= (is_anti() || is_extinction() ? KING : QUEEN));
#else
          assert(type_of(promotion) >= KNIGHT && type_of(promotion) <= (is_anti() ? KING : QUEEN));
#endif
#else
#ifdef EXTINCTION
          assert(type_of(promotion) >= KNIGHT && type_of(promotion) <= (is_extinction() ? KING : QUEEN));
#else
          assert(type_of(promotion) >= KNIGHT && type_of(promotion) <= QUEEN);
#endif
#endif

          remove_piece(pc, to);
          put_piece(promotion, to);
#ifdef CRAZYHOUSE
#ifdef LOOP
          if (is_house() && !is_loop())
#else
          if (is_house())
#endif
              promotedPieces = promotedPieces | to;
#endif

          // Update hash keys
          k ^= Zobrist::psq[pc][to] ^ Zobrist::psq[promotion][to];
          st->pawnKey ^= Zobrist::psq[pc][to];
          st->materialKey ^=  Zobrist::psq[promotion][pieceCount[promotion]-1]
                            ^ Zobrist::psq[pc][pieceCount[pc]];

          // Update material
          st->nonPawnMaterial[us] += PieceValue[CHESS_VARIANT][MG][promotion];
      }

      // Update pawn hash key and prefetch access to pawnsTable
#ifdef ATOMIC
      if (is_atomic() && captured)
          st->pawnKey ^= Zobrist::psq[make_piece(us, PAWN)][from];
      else
#endif
#ifdef CRAZYHOUSE
      if (is_house() && type_of(m) == DROP)
          st->pawnKey ^= Zobrist::psq[pc][to];
      else
#endif
      st->pawnKey ^= Zobrist::psq[pc][from] ^ Zobrist::psq[pc][to];
      prefetch2(thisThread->pawnsTable[st->pawnKey]);

      // Reset rule 50 draw counter
      st->rule50 = 0;
  }

  // Set capture piece
  st->capturedPiece = captured;
#ifdef CRAZYHOUSE
  if (is_house() && !captured)
      st->capturedpromoted = false;
#endif

  // Update the key with the final value
  st->key = k;

  // Calculate checkers bitboard (if move gives check)
  st->checkersBB = givesCheck ? attackers_to(square<KING>(them)) & pieces(us) : 0;

#ifdef CRAZYHOUSE
  if ((!is_house() || type_of(m) != DROP) && is_promoted(from))
      promotedPieces = (promotedPieces - from) | to;
#endif

  sideToMove = ~sideToMove;

  // Update king attacks used for fast check detection
  set_check_info(st);

  assert(pos_is_ok());
}


/// Position::undo_move() unmakes a move. When it returns, the position should
/// be restored to exactly the same state as before the move was made.

void Position::undo_move(Move m) {

  assert(is_ok(m));

  sideToMove = ~sideToMove;

  Color us = sideToMove;
  Square from = from_sq(m);
  Square to = to_sq(m);
  Piece pc = piece_on(to);
#ifdef ATOMIC
  if (is_atomic() && st->capturedPiece) // Restore the blast piece(s)
      pc = st->blast[from];
#endif

  assert(empty(to) || color_of(piece_on(to)) == us);
#ifdef CRAZYHOUSE
  assert((is_house() && type_of(m) == DROP) || empty(from) || type_of(m) == CASTLING);
#else
  assert(empty(from) || type_of(m) == CASTLING);
#endif
#ifdef ANTI
  if (is_anti()) {} else
#endif
#ifdef EXTINCTION
  if (is_extinction()) {} else
#endif
#ifdef TWOKINGS
  if (is_two_kings()) {} else
#endif
  {
  assert(type_of(st->capturedPiece) != KING);
  }

  if (type_of(m) == PROMOTION)
  {
      assert(relative_rank(us, to) == RANK_8);
#ifdef ATOMIC
      if (!is_atomic() || !st->capturedPiece)
      {
#endif
      assert(type_of(pc) == promotion_type(m));
#ifdef ANTI
#ifdef EXTINCTION
      assert(type_of(pc) >= KNIGHT && type_of(pc) <= (is_anti() || is_extinction() ? KING : QUEEN));
#else
      assert(type_of(pc) >= KNIGHT && type_of(pc) <= (is_anti() ? KING : QUEEN));
#endif
#else
#ifdef EXTINCTION
      assert(type_of(pc) >= KNIGHT && type_of(pc) <= (is_extinction() ? KING : QUEEN));
#else
      assert(type_of(pc) >= KNIGHT && type_of(pc) <= QUEEN);
#endif
#endif

      remove_piece(pc, to);
      pc = make_piece(us, PAWN);
      put_piece(pc, to);
#ifdef CRAZYHOUSE
      if (is_house())
          promotedPieces -= to;
#endif
#ifdef ATOMIC
      }
#endif
  }

  if (type_of(m) == CASTLING)
  {
      Square rfrom, rto;
      do_castling<false>(us, from, to, rfrom, rto);
  }
  else
  {
#ifdef ATOMIC
      if (is_atomic() && st->capturedPiece) // Restore the blast piece(s)
          put_piece(pc, from);
      else
#endif
#ifdef CRAZYHOUSE
      if (is_house() && type_of(m) == DROP)
          undrop_piece(pc, to); // Remove the dropped piece
      else
#endif
      move_piece(pc, to, from); // Put the piece back at the source square
#ifdef CRAZYHOUSE
      if (is_house() && is_promoted(to))
          promotedPieces = (promotedPieces - to) | from;
#endif

      if (st->capturedPiece)
      {
          Square capsq = to;

          if (type_of(m) == ENPASSANT)
          {
              capsq -= pawn_push(us);

              assert(type_of(pc) == PAWN);
              assert(to == st->previous->epSquare);
              assert(relative_rank(us, to) == RANK_6);
              assert(piece_on(capsq) == NO_PIECE);
              assert(st->capturedPiece == make_piece(~us, PAWN));
          }

#ifdef ATOMIC
          if (is_atomic() && st->capturedPiece) // Restore the blast piece(s)
          {
              Bitboard blast = attacks_from<KING>(to); // squares in blast radius
              while (blast)
              {
                  Square bsq = pop_lsb(&blast);
                  if (bsq == from)
                      continue;
                  Piece bpc = st->blast[bsq];
                  if (bpc != NO_PIECE && type_of(bpc) != PAWN)
                      put_piece(bpc, bsq);
              }
          }
#endif
          put_piece(st->capturedPiece, capsq); // Restore the captured piece
#ifdef CRAZYHOUSE
          if (is_house())
          {
#ifdef BUGHOUSE
              if (! is_bughouse())
#endif
              remove_from_hand(~color_of(st->capturedPiece), st->capturedpromoted ? PAWN : type_of(st->capturedPiece));
              if (st->capturedpromoted)
                  promotedPieces |= to;
          }
#endif
      }
  }

  // Finally point our state pointer back to the previous state
  st = st->previous;
  --gamePly;

  assert(pos_is_ok());
}


/// Position::do_castling() is a helper used to do/undo a castling move. This
/// is a bit tricky in Chess960 where from/to squares can overlap.
template<bool Do>
void Position::do_castling(Color us, Square from, Square& to, Square& rfrom, Square& rto) {

  bool kingSide = to > from;
  rfrom = to; // Castling is encoded as "king captures friendly rook"
  rto = relative_square(us, kingSide ? SQ_F1 : SQ_D1);
  to = relative_square(us, kingSide ? SQ_G1 : SQ_C1);

  // Remove both pieces first since squares could overlap in Chess960
  remove_piece(make_piece(us, KING), Do ? from : to);
  remove_piece(make_piece(us, ROOK), Do ? rfrom : rto);
  board[Do ? from : to] = board[Do ? rfrom : rto] = NO_PIECE; // Since remove_piece doesn't do it for us
  put_piece(make_piece(us, KING), Do ? to : from);
  put_piece(make_piece(us, ROOK), Do ? rto : rfrom);
}


/// Position::do(undo)_null_move() is used to do(undo) a "null move": It flips
/// the side to move without executing any move on the board.

void Position::do_null_move(StateInfo& newSt) {

  assert(!checkers());
  assert(&newSt != st);

  std::memcpy(&newSt, st, sizeof(StateInfo));
  newSt.previous = st;
  st = &newSt;

  if (st->epSquare != SQ_NONE)
  {
      st->key ^= Zobrist::enpassant[file_of(st->epSquare)];
      st->epSquare = SQ_NONE;
  }

  st->key ^= Zobrist::side;
  prefetch(TT.first_entry(st->key));

  ++st->rule50;
  st->pliesFromNull = 0;

  sideToMove = ~sideToMove;

  set_check_info(st);

  assert(pos_is_ok());
}

void Position::undo_null_move() {

  assert(!checkers());

  st = st->previous;
  sideToMove = ~sideToMove;
}


/// Position::key_after() computes the new hash key after the given move. Needed
/// for speculative prefetch. It doesn't recognize special moves like castling,
/// en-passant and promotions.

Key Position::key_after(Move m) const {

  Square from = from_sq(m);
  Square to = to_sq(m);
#ifdef CRAZYHOUSE
  Piece pc = is_house() && type_of(m) == DROP ? dropped_piece(m) : piece_on(from);
#else
  Piece pc = piece_on(from);
#endif
  Piece captured = piece_on(to);
  Key k = st->key ^ Zobrist::side;

  if (captured)
  {
      k ^= Zobrist::psq[captured][to];
#ifdef ATOMIC
      if (is_atomic())
      {
          Bitboard blast = (attacks_from<KING>(to) & (pieces() ^ pieces(PAWN))) - from;
          while (blast)
          {
              Square bsq = pop_lsb(&blast);
              Piece bpc = piece_on(bsq);
              k ^= Zobrist::psq[bpc][bsq];
          }
          return k ^ Zobrist::psq[pc][from];
      }
#endif
#ifdef CRAZYHOUSE
      if (is_house())
      {
          Piece add = is_promoted(to) ? make_piece(~color_of(captured), PAWN) : ~captured;
          k ^= Zobrist::inHand[add][pieceCountInHand[color_of(add)][type_of(add)] + 1]
              ^ Zobrist::inHand[add][pieceCountInHand[color_of(add)][type_of(add)]];
      }
#endif
  }

#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      return k ^ Zobrist::psq[pc][to] ^ Zobrist::inHand[pc][pieceCountInHand[color_of(pc)][type_of(pc)]]
            ^ Zobrist::inHand[pc][pieceCountInHand[color_of(pc)][type_of(pc)] - 1];
#endif
  return k ^ Zobrist::psq[pc][to] ^ Zobrist::psq[pc][from];
}

#ifdef ATOMIC
template<>
Value Position::see<ATOMIC_VARIANT>(Move m, PieceType nextVictim, Square s) const {
  assert(is_ok(m));

  Square from = from_sq(m);
  Color us = color_of(piece_on(from));
  Bitboard blast = attacks_from<KING>(to_sq(m)) & (pieces() ^ pieces(PAWN)) & ~SquareBB[from];
  if (s != to_sq(m))
      blast &= ~SquareBB[s];

  if (blast & pieces(~us,KING))
      return VALUE_MATE;
  if (s != to_sq(m) && (blast & pieces(us,KING)))
      return -VALUE_MATE;

  Value blastEval = PieceValue[var][MG][type_of(piece_on(s))] - PieceValue[var][MG][nextVictim];
  for (Color c = WHITE; c <= BLACK; ++c)
      for (PieceType pt = KNIGHT; pt <= QUEEN; ++pt)
          if (c == us)
              blastEval -= popcount(blast & pieces(c,pt)) * PieceValue[var][MG][pt];
          else
              blastEval += popcount(blast & pieces(c,pt)) * PieceValue[var][MG][pt];
  return blastEval;
}
#endif

/// Position::see_ge (Static Exchange Evaluation Greater or Equal) tests if the
/// SEE value of move is greater or equal to the given threshold. We'll use an
/// algorithm similar to alpha-beta pruning with a null window.

bool Position::see_ge(Move m, Value threshold) const {

  assert(is_ok(m));
#ifdef CRAZYHOUSE
  if (is_house() && color_of(moved_piece(m)) == sideToMove)
  {
      // Reduce threshold based on remaining material in hand
      if (gives_check(m))
          threshold -= material_in_hand(sideToMove) / 5;
      // Increase threshold based on remaining material in hand
      if (checkers())
          threshold += material_in_hand(~sideToMove) / 5;
      // Crazyhouse captures double in value (threshold is halved)
      threshold /= 2;
  }
#endif

#ifdef THREECHECK
  if (is_three_check() && color_of(moved_piece(m)) == sideToMove && gives_check(m))
      return true;
#endif

  // Only deal with normal moves, assume others pass a simple see
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP) {} else
#endif
  if (type_of(m) != NORMAL)
      return VALUE_ZERO >= threshold;

  Bitboard stmAttackers;
  Square from = from_sq(m), to = to_sq(m);
#ifdef CRAZYHOUSE
  PieceType nextVictim = type_of(is_house() && type_of(m) == DROP ? dropped_piece(m) : piece_on(from));
  Color us = color_of(is_house() && type_of(m) == DROP ? dropped_piece(m) : piece_on(from));
#else
  PieceType nextVictim = type_of(piece_on(from));
  Color us = color_of(piece_on(from));
#endif
  Color stm = ~us; // First consider opponent's move
#ifdef ATOMIC
  if (is_atomic())
  {
      if (capture(m))
          return see<ATOMIC_VARIANT>(m, nextVictim, to_sq(m)) >= threshold + 1;
      if (threshold > VALUE_ZERO)
          return false;

      Bitboard occupied = pieces() ^ from;
      stmAttackers = attackers_to(to, occupied) & occupied & pieces(stm) & ~pieces(KING);

      // Loop over attacking pieces
      while (stmAttackers)
      {
          Square s = pop_lsb(&stmAttackers);
          if (see<ATOMIC_VARIANT>(m, nextVictim, s) < threshold)
              return false;
      }
      return true;
  }
#endif
#ifdef EXTINCTION
  // Test if this move is a winning capture
  if (is_extinction() && (stm == sideToMove ? is_extinction_loss()
          : ! more_than_one(pieces(stm, type_of(m) == ENPASSANT ? PAWN : type_of(piece_on(to))))))
      return true;
#endif
  Value balance;   // Values of the pieces taken by us minus opponent's ones

  // The opponent may be able to recapture so this is the best result
  // we can hope for.
  balance = PieceValue[var][MG][piece_on(to)]- threshold;

  if (balance < VALUE_ZERO)
      return false;
#ifdef EXTINCTION
  // Test if a capture refutes this move
  if (is_extinction() && ! more_than_one(pieces(us, nextVictim)))
  {
      // Toggles to square occupancy in case of stm != sideToMove
      Bitboard occupied = pieces() ^ from ^ to;
      if (type_of(m) == ENPASSANT)
          occupied ^= make_square(file_of(to), rank_of(from));
      if (attackers_to(to, occupied) & occupied & pieces(stm))
          return false;
  }
#endif

  // Now assume the worst possible result: that the opponent can
  // capture our piece for free.
  balance -= PieceValue[var][MG][nextVictim];

  // If it is enough (like in PxQ) then return immediately. Note that
  // in case nextVictim == KING we always return here, this is ok
  // if the given move is legal.
  if (balance >= VALUE_ZERO)
      return true;

  // Find all attackers to the destination square, with the moving piece
  // removed, but possibly an X-ray attacker added behind it.
  Bitboard occupied;
#ifdef CRAZYHOUSE
  if (is_house() && type_of(m) == DROP)
      occupied = pieces() ^ to;
  else
#endif
  occupied = pieces() ^ from ^ to;
  Bitboard attackers = attackers_to(to, occupied) & occupied;
#ifdef TWOKINGS
  Square ksq = SQ_NONE;
#endif

  while (true)
  {
      stmAttackers = attackers & pieces(stm);

      // Don't allow pinned pieces to attack (except the king) as long as
      // all pinners are on their original square.
      if (!(st->pinners[~stm] & ~occupied))
          stmAttackers &= ~st->blockersForKing[stm];
#ifdef RACE
      // Exclude checks in racing kings
      if (is_race())
      {
          // Direct checks
          for (PieceType pt = KNIGHT; pt <= QUEEN; ++pt)
              if (attacks_from(pt, to) & square<KING>(~stm))
                  stmAttackers &= ~pieces(stm, pt);

          // Discovered checks
          if (!(st->pinners[stm] & ~occupied))
              stmAttackers &= ~st->blockersForKing[~stm];
      }
#endif

      // If stm has no more attackers then give up: stm loses
      if (!stmAttackers)
          break;

      // Locate and remove the next least valuable attacker, and add to
      // the bitboard 'attackers' the possibly X-ray attackers behind it.
      nextVictim = min_attacker<PAWN>(byTypeBB, to, stmAttackers, occupied, attackers);
#ifdef TWOKINGS
      if (is_two_kings() && nextVictim == KING)
      {
          two_kings_min_attacker(byTypeBB, to, stmAttackers, occupied, attackers);
          ksq = royal_king(stm, (pieces(stm, KING) & occupied) ^ to);
      }
#endif

      stm = ~stm; // Switch side to move

      // Negamax the balance with alpha = balance, beta = balance+1 and
      // add nextVictim's value.
      //
      //      (balance, balance+1) -> (-balance-1, -balance)
      //
      assert(balance < VALUE_ZERO);

#ifdef EXTINCTION
      if (is_extinction() && nextVictim == KING)
          balance = VALUE_ZERO;
      else
#endif
#ifdef HORDE
      if (is_horde() && nextVictim == KING)
          balance = VALUE_ZERO;
      else
#endif
#ifdef TWOKINGS
      // Moving the royal king (possibly into check) terminates the sequence
      if (is_two_kings() && nextVictim == KING && ksq == to)
          balance = VALUE_ZERO;
      else
#endif
      balance = -balance - 1 - PieceValue[var][MG][nextVictim];

      // If balance is still non-negative after giving away nextVictim then we
      // win. The only thing to be careful about it is that we should revert
      // stm if we captured with the king when the opponent still has attackers.
      if (balance >= VALUE_ZERO)
      {
#ifdef ANTI
          if (is_anti()) {} else
#endif
#ifdef EXTINCTION
          if (is_extinction())
          {
              if (!(pieces(~stm, nextVictim) & occupied) && (attackers & pieces(stm)))
                  stm = ~stm;
          }
          else
#endif
#ifdef TWOKINGS
          // If a non-royal king performed the final capture, do not apply
          // the special rule for a (valueless) royal king moving into check.
          if (is_two_kings() && nextVictim == KING && ksq != to) {} else
#endif
          if (nextVictim == KING && (attackers & pieces(stm)))
              stm = ~stm;
          break;
      }
#ifdef ANTI
#ifdef TWOKINGS
      // Assertions only impact debug mode performance
      assert(is_anti() || (is_two_kings() && pieces(~stm, KING) & occupied) || nextVictim != KING);
#else
      assert(is_anti() || nextVictim != KING);
#endif
#else
#ifdef TWOKINGS
      assert((is_two_kings() && pieces(~stm, KING) & occupied) || nextVictim != KING);
#else
      assert(nextVictim != KING);
#endif
#endif
  }
  return us != stm; // We break the above loop when stm loses
}


/// Position::is_draw() tests whether the position is drawn by 50-move rule
/// or by repetition. It does not detect stalemates.

bool Position::is_draw(int ply) const {

#ifdef CRAZYHOUSE
  if (is_house()) {} else
#endif
  if (st->rule50 > 99 && (!checkers() || MoveList<LEGAL>(*this).size()))
      return true;

#ifdef CRAZYHOUSE
  int end = is_house() ? st->pliesFromNull : std::min(st->rule50, st->pliesFromNull);
#else
  int end = std::min(st->rule50, st->pliesFromNull);
#endif

  if (end < 4)
    return false;

  StateInfo* stp = st->previous->previous;
  int cnt = 0;

  for (int i = 4; i <= end; i += 2)
  {
      stp = stp->previous->previous;

      // Return a draw score if a position repeats once earlier but strictly
      // after the root, or repeats twice before or at the root.
      if (   stp->key == st->key
          && ++cnt + (ply > i) == 2)
          return true;
  }

  return false;
}


// Position::has_repeated() tests whether there has been at least one repetition
// of positions since the last capture or pawn move.

bool Position::has_repeated() const {

    StateInfo* stc = st;
    while (true)
    {
        int i = 4, end = std::min(stc->rule50, stc->pliesFromNull);

        if (end < i)
            return false;

        StateInfo* stp = stc->previous->previous;

        do {
            stp = stp->previous->previous;

            if (stp->key == stc->key)
                return true;

            i += 2;
        } while (i <= end);

        stc = stc->previous;
    }
}


/// Position::has_game_cycle() tests if the position has a move which draws by repetition,
/// or an earlier position has a move that directly reaches the current position.

bool Position::has_game_cycle(int ply) const {

#ifdef ANTI
  if (is_anti())
      return false;
#endif
#ifdef LOSERS
  if (is_losers())
      return false;
#endif
  int j;

  int end = std::min(st->rule50, st->pliesFromNull);

  if (end < 3)
    return false;

  Key originalKey = st->key;
  StateInfo* stp = st->previous;

  for (int i = 3; i <= end; i += 2)
  {
      stp = stp->previous->previous;

      Key moveKey = originalKey ^ stp->key;
      if (   (j = H1(moveKey), cuckoo[j] == moveKey)
          || (j = H2(moveKey), cuckoo[j] == moveKey))
      {
          Move move = cuckooMove[j];
          Square s1 = from_sq(move);
          Square s2 = to_sq(move);

          if (!(between_bb(s1, s2) & pieces()))
          {
              // In the cuckoo table, both moves Rc1c5 and Rc5c1 are stored in the same
              // location. We select the legal one by reversing the move variable if necessary.
              if (empty(s1))
                  move = make_move(s2, s1);

              if (ply > i)
                  return true;

              // For repetitions before or at the root, require one more
              StateInfo* next_stp = stp;
              for (int k = i + 2; k <= end; k += 2)
              {
                  next_stp = next_stp->previous->previous;
                  if (next_stp->key == stp->key)
                     return true;
              }
          }
      }
  }
  return false;
}


/// Position::flip() flips position with the white and black sides reversed. This
/// is only useful for debugging e.g. for finding evaluation symmetry bugs.

void Position::flip() {

  string f, token;
  std::stringstream ss(fen());

  for (Rank r = RANK_8; r >= RANK_1; --r) // Piece placement
  {
      std::getline(ss, token, r > RANK_1 ? '/' : ' ');
      f.insert(0, token + (f.empty() ? " " : "/"));
  }

  ss >> token; // Active color
  f += (token == "w" ? "B " : "W "); // Will be lowercased later

  ss >> token; // Castling availability
  f += token + " ";

  std::transform(f.begin(), f.end(), f.begin(),
                 [](char c) { return char(islower(c) ? toupper(c) : tolower(c)); });

  ss >> token; // En passant square
  f += (token == "-" ? token : token.replace(1, 1, token[1] == '3' ? "6" : "3"));

  std::getline(ss, token); // Half and full moves
  f += token;

  set(f, is_chess960(), variant(), st, this_thread());

  assert(pos_is_ok());
}


/// Position::pos_is_ok() performs some consistency checks for the
/// position object and raises an asserts if something wrong is detected.
/// This is meant to be helpful when debugging.

bool Position::pos_is_ok() const {

  constexpr bool Fast = true; // Quick (default) or full check?

  Square wksq, bksq;
#ifdef ATOMIC
  if (is_atomic() && is_atomic_loss())
  {
      wksq = sideToMove == WHITE ? SQ_NONE : square<KING>(WHITE);
      bksq = sideToMove == BLACK ? SQ_NONE : square<KING>(BLACK);
  }
  else
#endif
#ifdef EXTINCTION
  if (is_extinction() && is_extinction_loss())
  {
      wksq = sideToMove == WHITE ? SQ_NONE : square<KING>(WHITE);
      bksq = sideToMove == BLACK ? SQ_NONE : square<KING>(BLACK);
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      wksq = is_horde_color(WHITE) ? SQ_NONE : square<KING>(WHITE);
      bksq = is_horde_color(BLACK) ? SQ_NONE : square<KING>(BLACK);
  }
  else
#endif
  wksq = square<KING>(WHITE), bksq = square<KING>(BLACK);

#ifdef ANTI
  if (is_anti())
  {
      if ((sideToMove != WHITE && sideToMove != BLACK)
          || (ep_square() != SQ_NONE && relative_rank(sideToMove, ep_square()) != RANK_6))
          assert(0 && "pos_is_ok: Default");
  }
  else
#endif
#ifdef EXTINCTION
  if (is_extinction() && is_extinction_loss())
  {
      if ((sideToMove != WHITE && sideToMove != BLACK)
          || (ep_square() != SQ_NONE && relative_rank(sideToMove, ep_square()) != RANK_6))
          assert(0 && "pos_is_ok: Default");
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      if ((sideToMove != WHITE && sideToMove != BLACK)
          || (is_horde_color(WHITE) ? wksq != SQ_NONE : piece_on(wksq) != W_KING)
          || (is_horde_color(BLACK) ? bksq != SQ_NONE : piece_on(bksq) != B_KING)
          || (ep_square() != SQ_NONE && relative_rank(sideToMove, ep_square()) < RANK_6))
          assert(0 && "pos_is_ok: Default");
  }
  else
#endif

  if (   (sideToMove != WHITE && sideToMove != BLACK)
#ifdef ATOMIC
      || ((!is_atomic() || wksq != SQ_NONE) && piece_on(wksq) != W_KING)
#else
      || piece_on(wksq) != W_KING
#endif
#ifdef ATOMIC
      || ((!is_atomic() || bksq != SQ_NONE) && piece_on(bksq) != B_KING)
#else
      || piece_on(bksq) != B_KING
#endif
      || (   ep_square() != SQ_NONE
          && relative_rank(sideToMove, ep_square()) != RANK_6))
      assert(0 && "pos_is_ok: Default");

  if (Fast)
      return true;

#ifdef ANTI
  if (is_anti()) {} else
#endif
#ifdef EXTINCTION
  if (is_extinction())
  {
      if (pieceCount[W_KING] + pieceCount[B_KING] < 1)
          assert(0 && "pos_is_ok: Kings (extinction)");
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      if (pieceCount[W_KING] + pieceCount[B_KING] != 1
          || (is_horde_color(sideToMove) && attackers_to(square<KING>(~sideToMove)) & pieces(sideToMove)))
          assert(0 && "pos_is_ok: Kings (horde)");
  }
  else
#endif
#ifdef ATOMIC
  if (is_atomic() && (is_atomic_win() || is_atomic_loss()))
  {
      if (pieceCount[W_KING] + pieceCount[B_KING] != 1)
          assert(0 && "pos_is_ok: Kings (atomic)");
  }
  else if (is_atomic() && kings_adjacent())
  {
      if (   pieceCount[W_KING] != 1
          || pieceCount[B_KING] != 1)
          assert(0 && "pos_is_ok: Kings (atomic)");
  }
  else
#endif
#ifdef TWOKINGS
  if (is_two_kings())
  {
      if (   pieceCount[W_KING] < 1
          || pieceCount[B_KING] < 1
          || attackers_to(royal_king(~sideToMove)) & pieces(sideToMove))
          assert(0 && "pos_is_ok: Kings (two kings)");
  }
  else
#endif
  if (   pieceCount[W_KING] != 1
      || pieceCount[B_KING] != 1
      || attackers_to(square<KING>(~sideToMove)) & pieces(sideToMove))
      assert(0 && "pos_is_ok: Kings");

#ifdef CRAZYHOUSE
  if (is_house())
  {
      if (   (pieces(PAWN) & (Rank1BB | Rank8BB))
          || pieceCount[W_PAWN] > 16
          || pieceCount[B_PAWN] > 16)
      assert(0 && "pos_is_ok: Pawns (crazyhouse)");
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      if (pieces(PAWN) & (is_horde_color(WHITE) ? Rank8BB : Rank1BB))
          assert(0 && "pos_is_ok: Pawns (horde)");
  }
  else
#endif
  if (   (pieces(PAWN) & (Rank1BB | Rank8BB))
      || pieceCount[W_PAWN] > 8
      || pieceCount[B_PAWN] > 8)
      assert(0 && "pos_is_ok: Pawns");

#ifdef CRAZYHOUSE
  if (is_house())
  {
      if (   (pieces(WHITE) & pieces(BLACK))
          || (pieces(WHITE) | pieces(BLACK)) != pieces()
          || popcount(pieces(WHITE)) > 32
          || popcount(pieces(BLACK)) > 32)
          assert(0 && "pos_is_ok: Bitboards (crazyhouse)");
  }
  else
#endif
#ifdef HORDE
  if (is_horde())
  {
      if (   (pieces(WHITE) & pieces(BLACK))
          || (pieces(WHITE) | pieces(BLACK)) != pieces()
          || popcount(pieces(WHITE)) > (is_horde_color(WHITE) ? 40 : 16)
          || popcount(pieces(BLACK)) > (is_horde_color(BLACK) ? 40 : 16))
          assert(0 && "pos_is_ok: Bitboards (horde)");
  }
  else
#endif
  if (   (pieces(WHITE) & pieces(BLACK))
      || (pieces(WHITE) | pieces(BLACK)) != pieces()
      || popcount(pieces(WHITE)) > 16
      || popcount(pieces(BLACK)) > 16)
      assert(0 && "pos_is_ok: Bitboards");

  for (PieceType p1 = PAWN; p1 <= KING; ++p1)
      for (PieceType p2 = PAWN; p2 <= KING; ++p2)
          if (p1 != p2 && (pieces(p1) & pieces(p2)))
              assert(0 && "pos_is_ok: Bitboards");

  StateInfo si = *st;
  set_state(&si);
  if (std::memcmp(&si, st, sizeof(StateInfo)))
      assert(0 && "pos_is_ok: State");
#ifdef ANTI
  if (is_anti() && st->checkersBB)
      assert(0 && "pos_is_ok: Checkers (antichess)");
#endif
#ifdef EXTINCTION
  if (is_extinction() && st->checkersBB)
      assert(0 && "pos_is_ok: Checkers (extinction)");
#endif

  for (Piece pc : Pieces)
  {
      if (   pieceCount[pc] != popcount(pieces(color_of(pc), type_of(pc)))
          || pieceCount[pc] != std::count(board, board + SQUARE_NB, pc))
          assert(0 && "pos_is_ok: Pieces");

      for (int i = 0; i < pieceCount[pc]; ++i)
          if (board[pieceList[pc][i]] != pc || index[pieceList[pc][i]] != i)
              assert(0 && "pos_is_ok: Index");
  }

  for (Color c = WHITE; c <= BLACK; ++c)
      for (CastlingSide s = KING_SIDE; s <= QUEEN_SIDE; s = CastlingSide(s + 1))
      {
          if (!can_castle(c | s))
              continue;

#if defined(ANTI) || defined(EXTINCTION) || defined(TWOKINGS)
          if (   piece_on(castlingRookSquare[c | s]) != make_piece(c, ROOK)
              || piece_on(castlingKingSquare[c | s]) != make_piece(c, KING)
              || castlingRightsMask[castlingRookSquare[c | s]] != (c | s)
              || (castlingRightsMask[castlingKingSquare[c | s]] & (c | s)) != (c | s))
#else
          if (   piece_on(castlingRookSquare[c | s]) != make_piece(c, ROOK)
              || castlingRightsMask[castlingRookSquare[c | s]] != (c | s)
              || (castlingRightsMask[square<KING>(c)] & (c | s)) != (c | s))
#endif
              assert(0 && "pos_is_ok: Castling");
      }

  return true;
}
