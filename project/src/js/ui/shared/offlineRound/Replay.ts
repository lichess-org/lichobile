import i18n from '../../../i18n';
import { askWorker } from '../../../utils';

export default class Replay {
  private data: OfflineGameData;
  private chessWorker: Worker;

  public ply: number;
  public situations: Array<GameSituation>;

  constructor(
    data: OfflineGameData,
    initSituations: Array<GameSituation>,
    initPly: number,
    chessWorker: Worker,
    onReplayAdded: (sit: GameSituation) => void,
    onThreefoldRepetition: (newStatus: GameStatus) => void) {

      this.ply = 0;
      this.situations = [];

      this.data = data;
      this.chessWorker = chessWorker;

      this.init(initSituations, initPly);

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

    public init(situations: Array<GameSituation>, ply: number) {
      this.situations = situations;
      this.ply = ply || 0;
    }

    public situation = (): GameSituation => {
      return this.situations[this.ply];
    }

    public addMove = (orig: Pos, dest: Pos, promotion: string) => {
      const sit = this.situation();
      this.chessWorker.postMessage({
        topic: 'move',
        payload: {
          variant: this.data.game.variant.key,
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
          variant: this.data.game.variant.key,
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
          variant: this.data.game.variant.key,
          initialFen: this.data.game.initialFen,
          pgnMoves: sit.pgnMoves
        }
      });
    }

    public pgn = () => {
      const sit = this.situation();
      return askWorker(this.chessWorker, {
        topic: 'pgnDump',
        payload: {
          variant: this.data.game.variant.key,
          initialFen: this.data.game.initialFen,
          pgnMoves: sit.pgnMoves
        }
      });
    }
}
