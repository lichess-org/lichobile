import { Plugins } from '@capacitor/core'
import i18n from '../../../i18n'
import * as chess from '../../../chess'
import { GameStatus } from '../../../lichess/interfaces/game'

export default class Replay {
  private variant!: VariantKey
  private initialFen!: string
  private onReplayAdded: (sit: chess.GameSituation) => void
  private onThreefoldRepetition: (newStatus: GameStatus) => void

  public ply!: number
  public situations!: Array<chess.GameSituation>

  constructor(
    variant: VariantKey,
    initialFen: string,
    initSituations: Array<chess.GameSituation>,
    initPly: number,
    onReplayAdded: (sit: chess.GameSituation) => void,
    onThreefoldRepetition: (newStatus: GameStatus) => void
  ) {

    this.init(variant, initialFen, initSituations, initPly)
    this.onReplayAdded = onReplayAdded
    this.onThreefoldRepetition = onThreefoldRepetition
  }

  public init(variant: VariantKey, initialFen: string, situations: Array<chess.GameSituation>, ply: number) {
    this.variant = variant
    this.initialFen = initialFen
    this.situations = situations
    this.ply = ply || 0
  }

  public situation = (): chess.GameSituation => {
    return this.situations[this.ply]
  }

  public addMove = (orig: Key, dest: Key, promotion?: Role) => {
    const sit = this.situation()
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
    .catch(console.error.bind(console))
  }

  public addDrop = (role: Role, key: Key) => {
    const sit = this.situation()
    chess.drop({
      variant: this.variant,
      fen: sit.fen,
      pgnMoves: sit.pgnMoves,
      uciMoves: sit.uciMoves,
      role,
      pos: key
    })
    .then(this.addMoveOrDrop)
    .catch(console.error.bind(console))
  }

  public claimDraw = () => {
    const sit = this.situation()
    chess.threefoldTest({
      variant: this.variant,
      initialFen: this.initialFen,
      pgnMoves: sit.pgnMoves
    })
    .then(resp => {
      if (resp.threefoldRepetition) {
        this.onThreefoldRepetition(resp.status)
      } else {
        Plugins.LiToast.show({ text: i18n('incorrectThreefoldClaim'), duration: 'short' })
      }
    })
    .catch(console.error.bind(console))
  }

  public pgn = (white: string, black: string) => {
    const sit = this.situation()
    return chess.pgnDump({
      variant: this.variant,
      initialFen: this.initialFen,
      pgnMoves: sit.pgnMoves,
      white,
      black
    })
  }

  private addMoveOrDrop = (moveOrDrop: chess.MoveResponse) => {
    this.ply++
    if (this.ply < this.situations.length) {
      this.situations = this.situations.slice(0, this.ply)
    }
    this.situations.push(moveOrDrop.situation)
    this.onReplayAdded(this.situation())
  }
}
