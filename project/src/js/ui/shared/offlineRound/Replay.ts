import i18n from '../../../i18n';
import { askWorker } from '../../../utils';

export default class Replay {
  private chessWorker: Worker;
  private variant: VariantKey;
  private initialFen: string;

  public ply: number;
  public situations: Array<GameSituation>;

  constructor(
    variant: VariantKey,
    initialFen: string,
    initSituations: Array<GameSituation>,
    initPly: number,
    chessWorker: Worker,
    onReplayAdded: (sit: GameSituation) => void,
    onThreefoldRepetition: (newStatus: GameStatus) => void) {

      this.chessWorker = chessWorker;
      this.init(variant, initialFen, initSituations, initPly);

      this.chessWorker.addEventListener('message', ({ data: msg }) => {
        const payload = msg.payload;
        switch (msg.topic) {
          case 'error':
            console.error(msg);
            break;
          case 'move':
          case 'drop':
            this.ply++;
            if (this.ply < this.situations.length) {
              this.situations = this.situations.slice(0, this.ply);
            }
            this.situations.push(payload.situation);
            onReplayAdded(this.situation());
            break;
          case 'threefoldTest':
            if (payload.threefoldRepetition) {
              onThreefoldRepetition(payload.status);
            } else {
              window.plugins.toast.show(i18n('incorrectThreefoldClaim'), 'short', 'center');
            }
            break;
        }
      });
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

    public addMove = (orig: Pos, dest: Pos, promotion?: string) => {
      const sit = this.situation();
      this.chessWorker.postMessage({
        topic: 'move',
        payload: {
          variant: this.variant,
          fen: sit.fen,
          pgnMoves: sit.pgnMoves,
          uciMoves: sit.uciMoves,
          promotion,
          orig,
          dest
        }
      });
    }

    public addDrop = (role: Role, key: Pos) => {
      const sit = this.situation();
      this.chessWorker.postMessage({
        topic: 'drop',
        payload: {
          variant: this.variant,
          fen: sit.fen,
          pgnMoves: sit.pgnMoves,
          uciMoves: sit.uciMoves,
          role,
          pos: key
        }
      });
    }

    public claimDraw = () => {
      const sit = this.situation();
      this.chessWorker.postMessage({
        topic: 'threefoldTest',
        payload: {
          variant: this.variant,
          initialFen: this.initialFen,
          pgnMoves: sit.pgnMoves
        }
      });
    }

    public pgn = (variant: VariantKey, initialFen: string) => {
      const sit = this.situation();
      return askWorker(this.chessWorker, {
        topic: 'pgnDump',
        payload: {
          variant: this.variant,
          initialFen: this.initialFen,
          pgnMoves: sit.pgnMoves
        }
      });
    }
}
