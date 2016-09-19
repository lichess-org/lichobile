import i18n from '../../../i18n';
import chess, { MoveResponse } from '../../../chess';

export default class Replay {
  private variant: VariantKey;
  private initialFen: string;
  private onReplayAdded: (sit: GameSituation) => void;
  private onThreefoldRepetition: (newStatus: GameStatus) => void;

  public ply: number;
  public situations: Array<GameSituation>;

  constructor(
    variant: VariantKey,
    initialFen: string,
    initSituations: Array<GameSituation>,
    initPly: number,
    onReplayAdded: (sit: GameSituation) => void,
    onThreefoldRepetition: (newStatus: GameStatus) => void) {

      this.init(variant, initialFen, initSituations, initPly);
      this.onReplayAdded = onReplayAdded;
      this.onThreefoldRepetition = onThreefoldRepetition;
    }

    public init(variant: VariantKey, initialFen: string, situations: Array<GameSituation>, ply: number) {
      this.variant = variant;
      this.initialFen = initialFen;
      this.situations = situations;
      this.ply = ply || 0;
    }

    public situation = (): GameSituation => {
      return this.situations[this.ply];
    }

    public addMove = (orig: Pos, dest: Pos, promotion?: Role) => {
      const sit = this.situation();
      chess.move({
        variant: this.variant,
        fen: sit.fen,
        pgnMoves: sit.pgnMoves,
        uciMoves: sit.uciMoves,
        promotion,
        orig,
        dest
      })
      .then(this.addMoveOrDrop)
      .catch(console.error.bind(console));
    }

    public addDrop = (role: Role, key: Pos) => {
      const sit = this.situation();
      chess.drop({
        variant: this.variant,
        fen: sit.fen,
        pgnMoves: sit.pgnMoves,
        uciMoves: sit.uciMoves,
        role,
        pos: key
      })
      .then(this.addMoveOrDrop)
      .catch(console.error.bind(console));
    }

    public claimDraw = () => {
      const sit = this.situation();
      chess.threefoldTest({
        variant: this.variant,
        initialFen: this.initialFen,
        pgnMoves: sit.pgnMoves
      })
      .then(resp => {
        if (resp.threefoldRepetition) {
          this.onThreefoldRepetition(resp.status);
        } else {
          window.plugins.toast.show(i18n('incorrectThreefoldClaim'), 'short', 'center');
        }
      })
      .catch(console.error.bind(console));
    }

    public pgn = (variant: VariantKey, initialFen: string) => {
      const sit = this.situation();
      return chess.pgnDump({
        variant: this.variant,
        initialFen: this.initialFen,
        pgnMoves: sit.pgnMoves
      });
    }

    private addMoveOrDrop = (moveOrDrop: MoveResponse) => {
      this.ply++;
      if (this.ply < this.situations.length) {
        this.situations = this.situations.slice(0, this.ply);
      }
      this.situations.push(moveOrDrop.situation);
      this.onReplayAdded(this.situation());
    }
}
