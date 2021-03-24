import { Plugins } from '@capacitor/core'
import { Rules, Square } from 'chessops/types'
import { SquareSet } from 'chessops/squareSet'
import { Board } from 'chessops/board'
import { Setup, Material, RemainingChecks } from 'chessops/setup'
import { Castles, setupPosition } from 'chessops/variant'
import { makeFen, parseFen, parseCastlingFen, INITIAL_FEN, EMPTY_FEN } from 'chessops/fen'

import Chessground from '../../chessground/Chessground'
import * as cgDrag from '../../chessground/drag'
import router from '../../router'
import { loadLocalJsonFile } from '../../utils'
import redraw from '../../utils/redraw'
import settings from '../../settings'
import menu, { MenuInterface } from './menu'
import pasteFenPopup from './pasteFenPopup'
import continuePopup, { Controller as ContinuePopupCtrl } from '../shared/continuePopup'
import i18n from '../../i18n'
import drag from './drag'
import { EditorState, BoardPosition, BoardPositionCategory, CastlingToggle, CastlingToggles, CASTLING_TOGGLES } from './interfaces'

export default class EditorCtrl {
  public menu: MenuInterface
  public pasteFenPopup: MenuInterface
  public continuePopup: ContinuePopupCtrl
  public chessground: Chessground

  public initFen: string
  public pockets: Material | undefined
  public turn: Color = 'white'
  public unmovedRooks: SquareSet | undefined
  public castlingToggles: CastlingToggles = { K: false, Q: false, k: false, q: false }
  public epSquare: Square | undefined
  public remainingChecks: RemainingChecks | undefined
  // TODO variants support
  public rules: Rules = 'chess'
  public halfmoves = 0
  public fullmoves = 0

  public positions: readonly BoardPosition[] = []
  public endgamesPositions: readonly BoardPosition[] = []
  public extraPositions: readonly BoardPosition[] = []

  public constructor(fen?: string) {
    this.initFen = fen || INITIAL_FEN

    this.menu = menu.controller(this)
    this.pasteFenPopup = pasteFenPopup.controller(this)
    this.continuePopup = continuePopup.controller()

    this.extraPositions = [{
      fen: INITIAL_FEN,
      name: i18n('startPosition'),
      eco: '',
    }, {
      fen: EMPTY_FEN,
      name: i18n('clearBoard'),
      eco: '',
    }]

    Promise.all([
      loadLocalJsonFile<readonly BoardPositionCategory[]>('data/positions.json'),
      loadLocalJsonFile<readonly BoardPosition[]>('data/endgames.json')
    ])
    .then(([openings, endgames]) => {
      this.positions =
      openings.reduce((acc: readonly BoardPosition[], c: BoardPositionCategory) =>
      acc.concat(c.positions), [])
      this.endgamesPositions = endgames
      redraw()
    })

    this.chessground = new Chessground({
      fen: this.initFen,
      orientation: 'white',
      movable: {
        free: true,
        color: 'both'
      },
      highlight: {
        lastMove: false,
        check: false
      },
      animation: {
        duration: 300
      },
      premovable: {
        enabled: false
      },
      draggable: {
        magnified: settings.game.magnified(),
        deleteOnDropOff: true
      },
      events: {
        change: this.onChange
      }
    })

    this.setFen(this.initFen)
  }

  bottomColor(): Color {
    return this.chessground ? this.chessground.state.orientation : 'white'
  }

  setCastlingToggle(id: CastlingToggle, value: boolean): void {
    if (this.castlingToggles[id] !== value) this.unmovedRooks = undefined
    this.castlingToggles[id] = value
    this.onChange()
  }

  setTurn(turn: Color): void {
    this.turn = turn
    this.onChange()
  }

  private onChange = () => {
    const fen = this.getFen()
    const path = `/editor/${encodeURIComponent(fen)}`
    window.history.replaceState(window.history.state, '', '?=' + path)
    redraw()
  }

  public onstart = (e: TouchEvent): void => drag(this, e)
  public onmove = (e: TouchEvent): void => cgDrag.move(this.chessground, e)
  public onend = (e: TouchEvent): void => cgDrag.end(this.chessground, e)

  public editorOnCreate = (vn: Mithril.VnodeDOM): void => {
    if (!vn.dom) return
    const editorNode = document.getElementById('boardEditor')
    if (editorNode) {
      editorNode.addEventListener('touchstart', this.onstart)
      editorNode.addEventListener('touchmove', this.onmove)
      editorNode.addEventListener('touchend', this.onend)
    }
  }

  public editorOnRemove = (): void => {
    const editorNode = document.getElementById('boardEditor')
    if (editorNode) {
      editorNode.removeEventListener('touchstart', this.onstart)
      editorNode.removeEventListener('touchmove', this.onmove)
      editorNode.removeEventListener('touchend', this.onend)
    }
  }

  private castlingToggleFen(): string {
    let fen = ''
    for (const toggle of CASTLING_TOGGLES) {
      if (this.castlingToggles[toggle]) fen += toggle
    }
    return fen
  }

  private getSetup(): Setup {
    const boardFen = this.chessground ? this.chessground.getFen() : this.initFen
    const board = parseFen(boardFen).unwrap(setup => setup.board, () => Board.empty())
    return {
      board,
      pockets: this.pockets,
      turn: this.turn,
      unmovedRooks: this.unmovedRooks || parseCastlingFen(board, this.castlingToggleFen()).unwrap(),
      epSquare: this.epSquare,
      remainingChecks: this.remainingChecks,
      halfmoves: this.halfmoves,
      fullmoves: this.fullmoves,
    }
  }

  public getFen(): string {
    return makeFen(this.getSetup(), {promoted: this.rules === 'crazyhouse'})
  }

  public getLegalFen(): string | undefined {
    return setupPosition(this.rules, this.getSetup()).unwrap(pos => {
      return makeFen(pos.toSetup(), {promoted: pos.rules === 'crazyhouse'})
    }, () => undefined)
  }

  private isPlayable(): boolean {
    return setupPosition(this.rules, this.getSetup()).unwrap(pos => !pos.isEnd(), () => false)
  }

  getState(): EditorState {
    return {
      fen: this.getFen(),
      legalFen: this.getLegalFen(),
      playable: this.rules === 'chess' && this.isPlayable(),
    }
  }

  private makeAnalysisUrl(legalFen: string): string {
    switch (this.rules) {
      case 'chess': return this.makeUrl('/analyse/fen/', legalFen)
      case '3check': return this.makeUrl('/analyse/variant/threeCheck/fen/', legalFen)
      case 'kingofthehill': return this.makeUrl('/analyse/variant/kingOfTheHill/fen/', legalFen)
      case 'racingkings': return this.makeUrl('/analyse/variant/racingKings/fen/', legalFen)
      case 'antichess':
      case 'atomic':
      case 'horde':
      case 'crazyhouse':
        return this.makeUrl(`/analyse/variant/${this.rules}/fen/`, legalFen)
    }
  }

  private makeUrl(baseUrl: string, fen: string): string {
    return baseUrl + encodeURIComponent(fen)
  }

  public loadNewFen = (newFen: string): void => {
    this.setFen(newFen)
  }

  public goToAnalyse = (): void => {
    const state = this.getState()
    if (state.legalFen) {
      router.set(this.makeAnalysisUrl(state.legalFen))
    }
  }

  public continueFromHere = (): void => {
    const state = this.getState()
    if (state.legalFen && state.playable) {
      this.continuePopup.open(state.legalFen, 'standard')
    } else {
      Plugins.LiToast.show({ text: i18n('invalidFen'), duration: 'short' })
    }
  }

  setFen(fen: string): boolean {
    return parseFen(fen).unwrap(setup => {
      if (this.chessground) {
        this.chessground.set({fen})
      }
      this.pockets = setup.pockets
      this.turn = setup.turn
      this.unmovedRooks = setup.unmovedRooks
      this.epSquare = setup.epSquare
      this.remainingChecks = setup.remainingChecks
      this.halfmoves = setup.halfmoves
      this.fullmoves = setup.fullmoves

      const castles = Castles.fromSetup(setup)
      this.castlingToggles['K'] = castles.rook.white.h !== undefined
      this.castlingToggles['Q'] = castles.rook.white.a !== undefined
      this.castlingToggles['k'] = castles.rook.black.h !== undefined
      this.castlingToggles['q'] = castles.rook.black.a !== undefined

      this.onChange()
      return true
    }, () => false)
  }

  setRules(rules: Rules): void {
    this.rules = rules
    if (rules !== 'crazyhouse') this.pockets = undefined
  else if (!this.pockets) this.pockets = Material.empty()
    if (rules !== '3check') this.remainingChecks = undefined
  else if (!this.remainingChecks) this.remainingChecks = RemainingChecks.default()
    this.onChange()
  }
}
